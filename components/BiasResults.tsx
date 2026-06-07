import type { AnalysisResult, SkinScoreItem } from "@/lib/types";
import { describeOverallBias } from "@/lib/display";
import { HowItWorks } from "@/components/HowItWorks";
import { ScoreCard } from "@/components/ScoreCard";
import { colors } from "@/lib/theme";

interface Props {
  result: AnalysisResult;
  sourcePreview: string;
}

function ItemSection({
  title,
  subtitle,
  items,
  sourcePreview,
}: {
  title: string;
  subtitle: string;
  items: SkinScoreItem[];
  sourcePreview: string;
}) {
  if (items.length === 0) return null;

  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>{title}</h2>
        <p style={styles.sectionSub}>{subtitle}</p>
      </div>
      <div style={styles.grid}>
        {items.map((item, index) => (
          <ScoreCard
            key={item.id}
            item={item}
            sourcePreview={sourcePreview}
            compact={index > 0}
          />
        ))}
      </div>
    </section>
  );
}

export function BiasResults({ result, sourcePreview }: Props) {
  const { items, biasIndex, averageDelta, taskId } = result;
  const inflated = items.filter((i) => i.delta > 0.5);
  const deflated = items.filter((i) => i.delta < -0.5);
  const neutral = items.filter((i) => Math.abs(i.delta) <= 0.5);
  const topItem = items[0];
  const overallText = describeOverallBias(biasIndex, inflated.length, deflated.length);

  return (
    <section style={styles.wrap}>
      <div style={styles.verdict}>
        <p style={styles.verdictEyebrow}>解析結果の要約</p>
        <h2 style={styles.verdictTitle}>
          検出結果は同じなのに、
          <span style={styles.verdictAccent}> 表示スコアだけ {items.length}項目でズレました</span>
        </h2>
        <p style={styles.verdictBody}>{overallText}</p>

        {topItem && Math.abs(topItem.delta) >= 2 && (
          <div style={styles.highlight}>
            <p style={styles.highlightLabel}>いちばん大きなズレ</p>
            <p style={styles.highlightText}>
              <strong>{topItem.label}</strong> — 測定値 {topItem.rawScore.toFixed(1)} → 表示用{" "}
              {topItem.uiScore}（{topItem.delta > 0 ? "+" : ""}
              {topItem.delta.toFixed(1)}点）
            </p>
          </div>
        )}

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>表示のズレ合計</p>
            <p style={styles.statValue}>
              {biasIndex > 0 ? "+" : ""}
              {biasIndex.toFixed(1)}点
            </p>
            <p style={styles.statSub}>
              1項目あたり平均 {averageDelta > 0 ? "+" : ""}
              {averageDelta.toFixed(1)}点
            </p>
          </div>
          <div style={{ ...styles.statCard, ...styles.statCardUp }}>
            <p style={styles.statLabel}>表示を上げた</p>
            <p style={{ ...styles.statValue, color: colors.semantic.success }}>{inflated.length}</p>
            <p style={styles.statSub}>項目</p>
          </div>
          <div style={{ ...styles.statCard, ...styles.statCardDown }}>
            <p style={styles.statLabel}>表示を下げた</p>
            <p style={{ ...styles.statValue, color: colors.semantic.error }}>{deflated.length}</p>
            <p style={styles.statSub}>項目</p>
          </div>
        </div>
      </div>

      <HowItWorks />

      <ItemSection
        title="表示を下げた項目"
        subtitle="測定値より表示用スコアが低い — 同じ検出なのに、アプリ上は厳しめに見える"
        items={deflated}
        sourcePreview={sourcePreview}
      />

      <ItemSection
        title="表示を上げた項目"
        subtitle="測定値より表示用スコアが高い — 同じ検出なのに、アプリ上は良く見える"
        items={inflated}
        sourcePreview={sourcePreview}
      />

      {neutral.length > 0 && (
        <ItemSection
          title="ほぼ一致した項目"
          subtitle="測定値と表示用スコアに大きな差がない"
          items={neutral}
          sourcePreview={sourcePreview}
        />
      )}

      <details style={styles.meta}>
        <summary>task_id</summary>
        <code style={styles.metaCode}>{taskId}</code>
      </details>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 8,
  },
  verdict: {
    background: `linear-gradient(135deg, ${colors.brand.light} 0%, ${colors.bg.page} 60%)`,
    border: `1px solid ${colors.border.selected}33`,
    borderRadius: 16,
    padding: "28px 28px 24px",
    marginBottom: 24,
  },
  verdictEyebrow: {
    margin: "0 0 8px",
    fontSize: 12,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: colors.brand.primary,
    fontWeight: 600,
  },
  verdictTitle: {
    margin: "0 0 12px",
    fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
    fontWeight: 700,
    lineHeight: 1.4,
    color: colors.text.primary,
  },
  verdictAccent: {
    color: colors.accent.cyan,
  },
  verdictBody: {
    margin: "0 0 20px",
    color: colors.text.secondary,
    fontSize: 15,
    maxWidth: 640,
    lineHeight: 1.6,
  },
  highlight: {
    background: colors.bg.page,
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 20,
    border: `1px solid ${colors.border.default}`,
  },
  highlightLabel: {
    margin: "0 0 6px",
    fontSize: 11,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  highlightText: {
    margin: 0,
    fontSize: 15,
    color: colors.text.primary,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
  },
  statCard: {
    background: colors.bg.page,
    borderRadius: 10,
    padding: "16px",
    border: `1px solid ${colors.border.default}`,
  },
  statCardUp: {
    borderColor: colors.semantic.successBorder,
  },
  statCardDown: {
    borderColor: colors.semantic.errorBorder,
  },
  statLabel: {
    margin: "0 0 6px",
    fontSize: 12,
    color: colors.text.muted,
  },
  statValue: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: colors.text.primary,
  },
  statSub: {
    margin: "6px 0 0",
    fontSize: 12,
    color: colors.text.muted,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    margin: "0 0 6px",
    fontSize: 20,
    fontWeight: 700,
    color: colors.text.primary,
  },
  sectionSub: {
    margin: 0,
    fontSize: 14,
    color: colors.text.muted,
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  meta: {
    marginTop: 16,
    fontSize: 12,
    color: colors.text.muted,
  },
  metaCode: {
    display: "block",
    marginTop: 8,
    fontSize: 11,
    wordBreak: "break-all",
    color: colors.text.muted,
  },
};
