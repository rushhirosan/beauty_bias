export function HowItWorks() {
  const steps = [
    {
      icon: "1",
      title: "APIが顔を分析",
      body: "シワ・毛穴などを検出し、マスク画像を生成します。",
    },
    {
      icon: "2",
      title: "2種類の点数を返す",
      body: "測定値（raw）と表示用（ui）のスコアが同時に返ります。",
    },
    {
      icon: "3",
      title: "検出は同じ、数字だけ違う",
      body: "マスクは共通。変わるのはユーザーに見せる点数だけです。",
    },
  ];

  return (
    <div style={styles.wrap}>
      <p style={styles.heading}>このアプリでわかること</p>
      <div style={styles.steps}>
        {steps.map((step) => (
          <div key={step.icon} style={styles.step}>
            <span style={styles.icon}>{step.icon}</span>
            <div>
              <p style={styles.stepTitle}>{step.title}</p>
              <p style={styles.stepBody}>{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={styles.note}>
        ※ 肌の良し悪しを判定するアプリではありません。APIが
        <strong style={styles.strong}> 表示用スコアをどれだけ動かしているか </strong>
        を見る実験ツールです。
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: "linear-gradient(180deg, #1a1a22 0%, #18181b 100%)",
    border: "1px solid #27272a",
    borderRadius: 16,
    padding: "24px",
    marginBottom: 32,
  },
  heading: {
    margin: "0 0 20px",
    fontSize: 14,
    fontWeight: 600,
    color: "#e4e4e7",
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  step: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  icon: {
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#7c3aed33",
    color: "#c4b5fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
  },
  stepTitle: {
    margin: "0 0 4px",
    fontSize: 14,
    fontWeight: 600,
    color: "#fafafa",
  },
  stepBody: {
    margin: 0,
    fontSize: 13,
    color: "#a1a1aa",
    lineHeight: 1.5,
  },
  note: {
    margin: 0,
    padding: "12px 14px",
    background: "#0f0f12",
    borderRadius: 8,
    fontSize: 13,
    color: "#71717a",
    lineHeight: 1.6,
  },
  strong: {
    color: "#f472b6",
    fontWeight: 600,
  },
};
