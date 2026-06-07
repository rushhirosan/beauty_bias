"use client";

import { useState } from "react";
import type { SkinScoreItem } from "@/lib/types";
import { describeItemBias, biasDirectionLabel } from "@/lib/display";
import { ScoreBar } from "@/components/ScoreBar";

interface Props {
  item: SkinScoreItem;
  sourcePreview: string;
  compact?: boolean;
}

export function ScoreCard({ item, sourcePreview, compact = false }: Props) {
  const [showMask, setShowMask] = useState(true);
  const absDelta = Math.abs(item.delta);
  const isUp = item.delta > 0;
  const direction = biasDirectionLabel(item.delta);

  return (
    <article
      style={{
        ...styles.card,
        borderLeftColor: isUp ? "#4ade80" : item.delta < -0.5 ? "#f87171" : "#52525b",
      }}
    >
      <div style={styles.cardHeader}>
        <div>
          <p style={styles.category}>{item.label}</p>
          <p style={styles.insight}>{describeItemBias(item)}</p>
        </div>
        {absDelta >= 2 && (
          <span
            style={{
              ...styles.badge,
              background: isUp ? "#4ade8022" : "#f8717122",
              color: isUp ? "#86efac" : "#fca5a5",
            }}
          >
            {direction}
          </span>
        )}
      </div>

      <div style={styles.shiftRow}>
        <div style={styles.scoreBox}>
          <span style={styles.scoreBoxLabel}>測定値</span>
          <span style={{ ...styles.scoreBoxValue, color: "#60a5fa" }}>
            {item.rawScore.toFixed(1)}
          </span>
        </div>

        <div style={styles.arrowCol}>
          <span
            style={{
              ...styles.deltaChip,
              color: isUp ? "#4ade80" : item.delta < -0.5 ? "#f87171" : "#a1a1aa",
              borderColor: isUp ? "#4ade8044" : item.delta < -0.5 ? "#f8717144" : "#3f3f46",
            }}
          >
            {item.delta > 0 ? "+" : ""}
            {item.delta.toFixed(1)}点
          </span>
          <span style={styles.arrow}>→</span>
        </div>

        <div style={{ ...styles.scoreBox, ...styles.scoreBoxUi }}>
          <span style={styles.scoreBoxLabel}>表示用</span>
          <span style={{ ...styles.scoreBoxValue, color: "#f472b6" }}>
            {item.uiScore}
          </span>
        </div>
      </div>

      <ScoreBar rawScore={item.rawScore} uiScore={item.uiScore} delta={item.delta} />

      {!compact && item.maskUrl && (
        <div style={styles.maskSection}>
          <p style={styles.maskHeading}>
            写真は1枚だけ。APIが返す検出結果も1種類。違うのは「どの点数をラベル表示するか」だけです。
          </p>

          <div style={styles.compareRow}>
            <AppMockPanel
              title="測定値をそのまま見せた場合"
              sub="API内部 (raw_score)"
              score={item.rawScore.toFixed(1)}
              scoreColor="#60a5fa"
              borderColor="#60a5fa55"
              source={sourcePreview}
              maskUrl={item.maskUrl}
              showMask={showMask}
            />

            <div style={styles.equalsCol} aria-hidden>
              <span style={styles.equalsBadge}>=</span>
              <span style={styles.equalsText}>同じ検出</span>
            </div>

            <AppMockPanel
              title="美容アプリが実際に見せる"
              sub="表示用 (ui_score)"
              score={String(item.uiScore)}
              scoreColor="#f472b6"
              borderColor="#f472b655"
              source={sourcePreview}
              maskUrl={item.maskUrl}
              showMask={showMask}
            />
          </div>

          <p style={styles.samePhotoNote}>
            左右は<strong style={styles.strong}>同じ写真・同じマスク</strong>
            のコピーです。顔の見た目に差はありません。違うのは上の説明文と、大きく表示した点数だけです。
          </p>

          <label style={styles.maskToggle}>
            <input
              type="checkbox"
              checked={showMask}
              onChange={(e) => setShowMask(e.target.checked)}
            />
            検出箇所を色で表示
          </label>
        </div>
      )}

      <details style={styles.details}>
        <summary style={styles.detailsSummary}>APIフィールド名を表示</summary>
        <p style={styles.detailsBody}>
          raw_score: {item.rawScore.toFixed(1)} / ui_score: {item.uiScore} / id:{" "}
          {item.id}
        </p>
      </details>
    </article>
  );
}

function AppMockPanel({
  title,
  sub,
  score,
  scoreColor,
  borderColor,
  source,
  maskUrl,
  showMask,
}: {
  title: string;
  sub: string;
  score: string;
  scoreColor: string;
  borderColor: string;
  source: string;
  maskUrl: string;
  showMask: boolean;
}) {
  return (
    <div style={{ ...styles.mockPanel, borderColor }}>
      <div style={styles.mockHeader}>
        <p style={styles.mockTitle}>{title}</p>
        <p style={styles.mockSub}>{sub}</p>
      </div>
      <div
        style={{
          ...styles.mockScore,
          color: scoreColor,
          borderColor: `${scoreColor}44`,
          background: `${scoreColor}14`,
        }}
      >
        {score}
        <span style={styles.mockScoreUnit}>点</span>
      </div>
      <div style={styles.overlayFrame}>
        <img src={source} alt="" style={styles.baseImg} />
        {showMask && <img src={maskUrl} alt="" style={styles.maskImg} />}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: "20px 24px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  category: {
    margin: "0 0 6px",
    fontSize: 17,
    fontWeight: 700,
    color: "#fafafa",
  },
  insight: {
    margin: 0,
    fontSize: 14,
    color: "#a1a1aa",
    lineHeight: 1.5,
    maxWidth: 520,
  },
  badge: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 999,
  },
  shiftRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  scoreBox: {
    flex: 1,
    background: "#0f0f12",
    borderRadius: 10,
    padding: "14px 16px",
    border: "1px solid #27272a",
  },
  scoreBoxUi: {
    borderColor: "#f472b633",
    background: "#f472b608",
  },
  scoreBoxLabel: {
    display: "block",
    fontSize: 11,
    color: "#71717a",
    marginBottom: 4,
    letterSpacing: "0.04em",
  },
  scoreBoxValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
  },
  arrowCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  deltaChip: {
    fontSize: 13,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid",
    whiteSpace: "nowrap",
  },
  arrow: {
    fontSize: 20,
    color: "#52525b",
  },
  maskSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTop: "1px solid #27272a",
  },
  maskHeading: {
    margin: "0 0 16px",
    fontSize: 14,
    color: "#d4d4d8",
    lineHeight: 1.5,
  },
  compareRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    gap: 12,
    alignItems: "stretch",
  },
  equalsCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: "0 4px",
    flexShrink: 0,
  },
  equalsBadge: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#27272a",
    border: "2px solid #52525b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 700,
    color: "#a1a1aa",
  },
  equalsText: {
    fontSize: 11,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 1.3,
    maxWidth: 48,
  },
  mockPanel: {
    background: "#0f0f12",
    border: "2px solid",
    borderRadius: 12,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  mockHeader: {
    padding: "12px 14px 0",
  },
  mockTitle: {
    margin: "0 0 2px",
    fontSize: 12,
    fontWeight: 600,
    color: "#e4e4e7",
    lineHeight: 1.4,
  },
  mockSub: {
    margin: 0,
    fontSize: 11,
    color: "#71717a",
  },
  mockScore: {
    margin: "10px 14px 12px",
    fontSize: 36,
    fontWeight: 800,
    lineHeight: 1,
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid",
    textAlign: "center",
  },
  mockScoreUnit: {
    fontSize: 16,
    fontWeight: 600,
    marginLeft: 2,
  },
  samePhotoNote: {
    margin: "14px 0 0",
    padding: "12px 14px",
    background: "#fbbf2414",
    border: "1px solid #fbbf2433",
    borderRadius: 8,
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 1.6,
  },
  strong: {
    color: "#fcd34d",
    fontWeight: 600,
  },
  overlayFrame: {
    position: "relative",
    aspectRatio: "4/3",
    background: "#09090b",
    marginTop: "auto",
  },
  baseImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  maskImg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    mixBlendMode: "screen",
    opacity: 0.85,
  },
  maskToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#71717a",
    marginTop: 12,
    cursor: "pointer",
  },
  details: {
    marginTop: 16,
    fontSize: 12,
    color: "#52525b",
  },
  detailsSummary: {
    cursor: "pointer",
    color: "#52525b",
  },
  detailsBody: {
    margin: "8px 0 0",
    fontFamily: "ui-monospace, monospace",
    fontSize: 11,
  },
};
