const API_BASE = "https://yce-api-01.makeupar.com";

const HD_ACTIONS = [
  "hd_wrinkle",
  "hd_pore",
  "hd_texture",
  "hd_moisture",
  "hd_acne",
] as const;

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;

type ApiEnvelope<T> = {
  status: number;
  data?: T;
  error?: string;
  error_code?: string;
};

type FileInitResponse = {
  files: Array<{
    file_id: string;
    requests: Array<{
      method: string;
      url: string;
      headers: Record<string, string>;
    }>;
  }>;
};

type TaskCreateResponse = {
  task_id: string;
};

type TaskOutputItem = {
  type: string;
  ui_score?: number;
  raw_score?: number;
  mask_urls?: string[];
  sub_region?: string;
};

type TaskResultResponse = {
  task_status: "running" | "success" | "error";
  results?: {
    output?: TaskOutputItem[];
  };
  error?: string;
  error_code?: string;
};

function requireApiKey(apiKey: string | undefined): string {
  const key = apiKey?.trim();
  if (!key) {
    throw new Error("YouCam API キーを入力してください");
  }
  return key;
}

async function apiFetch<T>(
  path: string,
  apiKey: string,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireApiKey(apiKey)}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || body.status >= 400) {
    throw new Error(
      body.error ?? body.error_code ?? `API error (${res.status})`,
    );
  }
  return body;
}

export async function initFileUpload(
  apiKey: string,
  fileName: string,
  contentType: string,
  fileSize: number,
): Promise<{ fileId: string; uploadUrl: string; uploadHeaders: Record<string, string> }> {
  const body = await apiFetch<FileInitResponse>("/s2s/v2.1/file/skin-analysis", apiKey, {
    method: "POST",
    body: JSON.stringify({
      files: [{ content_type: contentType, file_name: fileName, file_size: fileSize }],
    }),
  });

  const file = body.data?.files?.[0];
  const request = file?.requests?.[0];
  if (!file?.file_id || !request?.url) {
    throw new Error("Invalid file upload response");
  }

  return {
    fileId: file.file_id,
    uploadUrl: request.url,
    uploadHeaders: request.headers ?? { "Content-Type": contentType },
  };
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  buffer: Buffer,
  headers: Record<string, string>,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Length": String(buffer.length),
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    throw new Error(`File upload failed (${res.status})`);
  }
}

export async function createSkinAnalysisTask(
  apiKey: string,
  fileId: string,
): Promise<string> {
  const body = await apiFetch<TaskCreateResponse>("/s2s/v2.1/task/skin-analysis", apiKey, {
    method: "POST",
    body: JSON.stringify({
      src_file_id: fileId,
      dst_actions: [...HD_ACTIONS],
      format: "json",
    }),
  });

  const taskId = body.data?.task_id;
  if (!taskId) {
    throw new Error("task_id missing from response");
  }
  return taskId;
}

function regionFromMaskUrl(url: string | undefined): string | null {
  if (!url) return null;
  const name = url.split("/").pop()?.split("?")[0] ?? "";
  const match = name.match(/_output_([^./]+)\.(png|jpe?g)$/i);
  const region = match?.[1];
  if (!region) return null;
  return region === "all" ? "whole" : region;
}

function buildTypeKey(baseType: string, region: string | null): string {
  if (!region) return baseType;
  if (baseType.endsWith(`_${region}`)) return baseType;
  return `${baseType}_${region}`;
}

function resolveItemType(item: TaskOutputItem, index: number): string {
  const region = item.sub_region ?? regionFromMaskUrl(item.mask_urls?.[0]);
  return buildTypeKey(item.type, region ?? null) || `${item.type}__${index}`;
}

function ensureUniqueTypes(items: TaskOutputItem[]): TaskOutputItem[] {
  const used = new Set<string>();
  return items.map((item, index) => {
    let type = resolveItemType(item, index);
    let suffix = 0;
    while (used.has(type)) {
      suffix += 1;
      type = `${resolveItemType(item, index)}_${suffix}`;
    }
    used.add(type);
    return { ...item, type };
  });
}

function normalizeOutputItem(item: TaskOutputItem): TaskOutputItem[] {
  if (item.ui_score == null || item.raw_score == null) {
    return [];
  }

  const region = item.sub_region ?? regionFromMaskUrl(item.mask_urls?.[0]);
  const baseType = buildTypeKey(item.type, region ?? null);

  return [{ ...item, type: baseType, sub_region: region ?? item.sub_region }];
}

function flattenOutput(raw: unknown): TaskOutputItem[] {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];

      const obj = entry as Record<string, unknown>;
      const parentType =
        typeof obj.type === "string" ? obj.type : undefined;

      if ("ui_score" in obj) {
        return normalizeOutputItem(entry as TaskOutputItem);
      }

      if (
        parentType &&
        ("whole" in obj || "forehead" in obj || "nose" in obj || "cheek" in obj)
      ) {
        return Object.entries(obj).flatMap(([region, value]) => {
          if (region === "type" || !value || typeof value !== "object") return [];
          if (!("ui_score" in value)) return [];
          const row = value as TaskOutputItem;
          return normalizeOutputItem({
            ...row,
            type: parentType,
            sub_region: region,
          });
        });
      }

      return [];
    });
  }

  return [];
}

export async function pollSkinAnalysisTask(
  apiKey: string,
  taskId: string,
): Promise<TaskOutputItem[]> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const body = await apiFetch<TaskResultResponse>(
      `/s2s/v2.1/task/skin-analysis/${encodeURIComponent(taskId)}`,
      apiKey,
      { method: "GET" },
    );

    const status = body.data?.task_status;
    if (status === "running") {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    if (status === "error") {
      throw new Error(body.data?.error ?? "Skin analysis task failed");
    }

    if (status === "success") {
      const output = body.data?.results?.output ?? [];
      const flat = flattenOutput(output);
      const normalized =
        flat.length > 0
          ? flat
          : output.flatMap(normalizeOutputItem);
      return ensureUniqueTypes(normalized);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Analysis timed out — try again");
}

export async function analyzeSkinImage(
  apiKey: string,
  buffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ taskId: string; output: TaskOutputItem[] }> {
  const { fileId, uploadUrl, uploadHeaders } = await initFileUpload(
    apiKey,
    fileName,
    contentType,
    buffer.length,
  );

  await uploadToPresignedUrl(uploadUrl, buffer, uploadHeaders);
  const taskId = await createSkinAnalysisTask(apiKey, fileId);
  const output = await pollSkinAnalysisTask(apiKey, taskId);

  return { taskId, output };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
