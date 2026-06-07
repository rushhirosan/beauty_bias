interface Props {
  rawScore: number;
  uiScore: number;
  delta: number;
}

export function ScoreBar({ rawScore, uiScore, delta }: Props) {
  const rawPct = Math.min(100, Math.max(0, rawScore));
  const uiPct = Math.min(100, Math.max(0, uiScore));
  const isUp = delta > 0;

  return (
    <div style={styles.wrap}>
      <div style={styles.scale}>
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
      <div style={styles.track}>
        {rawPct <= uiPct ? (
          <div
            style={{
              ...styles.gap,
              left: `${rawPct}%`,
              width: `${Math.max(uiPct - rawPct, 0.5)}%`,
              background: isUp ? "#4ade8033" : "#f8717133",
            }}
          />
        ) : (
          <div
            style={{
              ...styles.gap,
              left: `${uiPct}%`,
              width: `${Math.max(rawPct - uiPct, 0.5)}%`,
              background: isUp ? "#4ade8033" : "#f8717133",
            }}
          />
        )}
        <div
          style={{ ...styles.marker, left: `${rawPct}%`, background: "#60a5fa" }}
          title={`測定値 ${rawScore.toFixed(1)}`}
        />
        <div
          style={{ ...styles.marker, left: `${uiPct}%`, background: "#f472b6" }}
          title={`表示用 ${uiScore}`}
        />
      </div>
      <div style={styles.legend}>
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, background: "#60a5fa" }} />
          測定値 {rawScore.toFixed(1)}
        </span>
        <span style={styles.legendItem}>
          <span style={{ ...styles.dot, background: "#f472b6" }} />
          表示用 {uiScore}
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 8,
  },
  scale: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#52525b",
    marginBottom: 4,
    padding: "0 2px",
  },
  track: {
    position: "relative",
    height: 10,
    background: "#27272a",
    borderRadius: 999,
  },
  gap: {
    position: "absolute",
    top: 0,
    height: "100%",
    borderRadius: 999,
  },
  marker: {
    position: "absolute",
    top: -3,
    width: 4,
    height: 16,
    borderRadius: 2,
    transform: "translateX(-50%)",
    boxShadow: "0 0 0 2px #18181b",
  },
  legend: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 10,
    fontSize: 12,
    color: "#a1a1aa",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
};
