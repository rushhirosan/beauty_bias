const STORAGE_KEY = "beauty_bias_perfectcorp_api_key";

export function loadStoredApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(STORAGE_KEY)?.trim() ?? "";
  } catch {
    return "";
  }
}

export function saveStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = key.trim();
    if (trimmed) {
      sessionStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // sessionStorage unavailable (private mode, etc.)
  }
}

export const PERFECTCORP_API_KEY_HEADER = "X-Perfectcorp-Api-Key";
