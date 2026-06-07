export async function readJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  const body = await res.text();

  if (!contentType.includes("application/json")) {
    if (body.startsWith("<!DOCTYPE") || body.startsWith("<html")) {
      throw new Error(
        "API が HTML エラーを返しました。dev サーバーを再起動してからもう一度お試しください。",
      );
    }
    throw new Error(body.slice(0, 200) || "Unexpected non-JSON response");
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error("API レスポンスの JSON 解析に失敗しました");
  }
}
