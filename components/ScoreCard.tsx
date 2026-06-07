"use client";

import { useState } from "react";
import type { SkinScoreItem } from "@/lib/types";
import { describeItemBias, biasDirectionLabel } from "@/lib/display";
import { ScoreBar } from "@/components/ScoreBar";
import { colors } from "@/lib/theme";

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
        borderLeftColor: isUp
          ? colors.semantic.success
          : item.delta < -0.5
            ? colors.semantic.error
            : colors.text.muted,
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
              background: isUp ? colors.semantic.successBg : colors.semantic.errorBg,
              color: isUp ? colors.semantic.success : colors.semantic.error,
            }}
          >
            {direction}
          </span>
        )}
      </div>

      <div style={styles.shiftRow}>
        <div style={styles.scoreBox}>
          <span style={styles.scoreBoxLabel}>測定値</span>
          <span style={{ ...styles.scoreBoxValue, color: colors.score.raw }}>
            {item.rawScore.toFixed(1)}
          </span>
        </div>

        <div style={styles.arrowCol}>
          <span
            style={{
              ...styles.deltaChip,
              color: isUp
                ? colors.semantic.success
                : item.delta < -0.5
                  ? colors.semantic.error
                  : colors.text.secondary,
              borderColor: isUp
                ? colors.semantic.successBorder
                : item.delta < -0.5
                  ? colors.semantic.errorBorder
                  : colors.border.strong,
            }}
          >
            {item.delta > 0 ? "+" : ""}
            {item.delta.toFixed(1)}点
          </span>
          <span style={styles.arrow}>→</span>
        </div>

        <div style={{ ...styles.scoreBox, ...styles.scoreBoxUi }}>
          <span style={styles.scoreBoxLabel}>表示用</span>
          <span style={{ ...styles.scoreBoxValue, color: colors.score.ui }}>
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
              scoreColor={colors.score.raw}
              borderColor={`${colors.score.raw}55`}
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
              scoreColor={colors.score.ui}
              borderColor={`${colors.score.ui}55`}
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
    background: colors.bg.page,
    border: `1px solid ${colors.border.default}`,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 1px 3px rgba(17, 24, 26, 0.06)",
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
    color: colors.text.primary,
  },
  insight: {
    margin: 0,
    fontSize: 14,
    color: colors.text.secondary,
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
    background: colors.brand.light,
    borderRadius: 10,
    padding: "14px 16px",
    border: `1px solid ${colors.border.default}`,
  },
  scoreBoxUi: {
    borderColor: `${colors.score.ui}33`,
    background: `${colors.score.ui}08`,
  },
  scoreBoxLabel: {
    display: "block",
    fontSize: 11,
    color: colors.text.muted,
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
    color: colors.text.muted,
  },
  maskSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTop: `1px solid ${colors.border.default}`,
  },
  maskHeading: {
    margin: "0 0 16px",
    fontSize: 14,
    color: colors.text.primary,
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
    background: colors.brand.light,
    border: `2px solid ${colors.border.strong}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 700,
    color: colors.text.secondary,
  },
  equalsText: {
    fontSize: 11,
    color: colors.text.muted,
    textAlign: "center",
    lineHeight: 1.3,
    maxWidth: 48,
  },
  mockPanel: {
    background: colors.bg.subtle,
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
    color: colors.text.primary,
    lineHeight: 1.4,
  },
  mockSub: {
    margin: 0,
    fontSize: 11,
    color: colors.text.muted,
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
    background: colors.semantic.warningBg,
    border: `1px solid ${colors.semantic.warningBorder}`,
    borderRadius: 8,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 1.6,
  },
  strong: {
    color: colors.accent.teal,
    fontWeight: 600,
  },
  overlayFrame: {
    position: "relative",
    aspectRatio: "4/3",
    background: colors.bg.muted,
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
    color: colors.text.muted,
    marginTop: 12,
    cursor: "pointer",
  },
  details: {
    marginTop: 16,
    fontSize: 12,
    color: colors.text.muted,
  },
  detailsSummary: {
    cursor: "pointer",
    color: colors.text.muted,
  },
  detailsBody: {
    margin: "8px 0 0",
    fontFamily: "ui-monospace, monospace",
    fontSize: 11,
  },
};
