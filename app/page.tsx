"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalysisResult } from "@/lib/types";
import {
  loadStoredApiKey,
  PERFECTCORP_API_KEY_HEADER,
  saveStoredApiKey,
} from "@/lib/apiKeyStorage";
import { ApiKeyField } from "@/components/ApiKeyField";
import { BiasResults } from "@/components/BiasResults";
import { HowItWorks } from "@/components/HowItWorks";
import { readJsonResponse } from "@/lib/fetchJson";

type Phase = "idle" | "loading" | "done" | "error";

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    setApiKey(loadStoredApiKey());
  }, []);

  function handleApiKeyChange(value: string) {
    setApiKey(value);
    saveStoredApiKey(value);
  }

  async function handleFile(file: File) {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError("YouCam API キーを入力してください");
      setPhase("error");
      return;
    }

    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setPhase("loading");
    setProgress("画像をアップロード中…");

    const formData = new FormData();
    formData.append("image", file);

    try {
      setProgress("Skin Analysis API を実行中（30〜60秒）…");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { [PERFECTCORP_API_KEY_HEADER]: trimmedKey },
        body: formData,
      });
      const data = await readJsonResponse<AnalysisResult & { error?: string }>(res);

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }

      setResult(data as AnalysisResult);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setPhase("error");
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  function reset() {
    setPhase("idle");
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const showIdleExplainer = phase === "idle" || phase === "error";

  return (
    <main style={styles.main}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Beauty Bias Lab</p>
        <h1 style={styles.title}>
          美容APIは
          <span style={styles.accent}> 同じ顔に2つの点数 </span>
          を返す
        </h1>
        <p style={styles.lead}>
          YouCam Skin Analysis API は1回の解析で「測定値」と「表示用スコア」の2種類を返します。
          検出したシワ・毛穴の場所（マスク）は同じなのに、ユーザーに見せる数字だけが変わります。
        </p>
      </header>

      <ApiKeyField value={apiKey} onChange={handleApiKeyChange} />

      <section style={styles.uploadSection}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={onInputChange}
        />
        <button
          type="button"
          style={{
            ...styles.primaryBtn,
            opacity: phase === "loading" || !apiKey.trim() ? 0.6 : 1,
          }}
          disabled={phase === "loading" || !apiKey.trim()}
          onClick={() => inputRef.current?.click()}
        >
          {phase === "loading" ? "分析中…" : "自撮りをアップロードして試す"}
        </button>
        {(phase === "idle" || phase === "error") && (
          <p style={styles.hint}>
            正面向き・明るい環境・顔が画面幅の60%以上（API 仕様）
          </p>
        )}
        {phase === "loading" && (
          <div style={styles.loadingBox}>
            <p style={styles.progress}>{progress}</p>
            {preview && (
              <img src={preview} alt="分析中の画像" style={styles.loadingPreview} />
            )}
          </div>
        )}
        {error && <p style={styles.error}>{error}</p>}
        {(phase === "done" || phase === "error") && (
          <button type="button" style={styles.secondaryBtn} onClick={reset}>
            別の写真を試す
          </button>
        )}
      </section>

      {showIdleExplainer && <HowItWorks />}

      {result && preview && <BiasResults result={result} sourcePreview={preview} />}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 800,
    minHeight: "100vh",
    margin: "0 auto",
    padding: "48px 24px 80px",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: 32,
  },
  eyebrow: {
    margin: "0 0 8px",
    fontSize: 13,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#a78bfa",
  },
  title: {
    margin: "0 0 16px",
    fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
    fontWeight: 700,
    lineHeight: 1.3,
  },
  accent: {
    color: "#f472b6",
  },
  lead: {
    margin: 0,
    color: "#a1a1aa",
    fontSize: 15,
    lineHeight: 1.7,
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 32,
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #7c3aed, #db2777)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "14px 28px",
    fontWeight: 600,
    fontSize: 16,
  },
  secondaryBtn: {
    background: "transparent",
    color: "#a1a1aa",
    border: "1px solid #3f3f46",
    borderRadius: 8,
    padding: "10px 20px",
  },
  hint: {
    margin: 0,
    fontSize: 13,
    color: "#71717a",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  progress: {
    margin: 0,
    fontSize: 14,
    color: "#a78bfa",
  },
  loadingPreview: {
    maxWidth: 160,
    borderRadius: 10,
    border: "1px solid #27272a",
    opacity: 0.7,
  },
  error: {
    margin: 0,
    color: "#f87171",
    fontSize: 14,
  },
};
