import { NextRequest, NextResponse } from "next/server";
import { PERFECTCORP_API_KEY_HEADER } from "@/lib/apiKeyStorage";
import { analyzeSkinImage } from "@/lib/perfectcorp";
import {
  computeBiasIndex,
  labelForType,
  type SkinScoreItem,
} from "@/lib/types";

export const maxDuration = 120;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const MAX_BYTES = 10 * 1024 * 1024;

function resolveRequestApiKey(request: NextRequest): string | null {
  const fromHeader = request.headers.get(PERFECTCORP_API_KEY_HEADER)?.trim();
  if (fromHeader) return fromHeader;

  const fromEnv = process.env.PERFECTCORP_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = resolveRequestApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouCam API キーを入力してください" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "image field is required" }, { status: 400 });
    }

    const contentType = file.type || "image/jpeg";
    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        { error: "Supported formats: JPEG, PNG" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { taskId, output } = await analyzeSkinImage(
      apiKey,
      buffer,
      file.name || "selfie.jpg",
      contentType,
    );

    const items: SkinScoreItem[] = output
      .map((row) => {
        const uiScore = row.ui_score ?? 0;
        const rawScore = row.raw_score ?? 0;
        return {
          id: row.type,
          label: labelForType(row.type),
          uiScore,
          rawScore,
          delta: uiScore - rawScore,
          maskUrl: row.mask_urls?.[0] ?? null,
        };
      })
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    const { biasIndex, averageDelta } = computeBiasIndex(items);

    return NextResponse.json({
      items,
      biasIndex,
      averageDelta,
      taskId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    const isAuth = message.includes("YouCam API キー");
    return NextResponse.json(
      { error: message },
      { status: isAuth ? 401 : 500 },
    );
  }
}
