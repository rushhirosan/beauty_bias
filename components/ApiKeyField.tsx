"use client";

import { colors } from "@/lib/theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ApiKeyField({ value, onChange }: Props) {
  return (
    <div style={styles.wrap}>
      <label htmlFor="perfectcorp-api-key" style={styles.label}>
        YouCam API キー
      </label>
      <input
        id="perfectcorp-api-key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        placeholder="sk-..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
      <p style={styles.hint}>
        このタブの sessionStorage にのみ保存します。解析時はあなたのキーで YouCam API
        を呼び出します（作者のクレジットは消費されません）。
        <a
          href="https://yce.makeupar.com/api-console/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          API Console
        </a>
        から発行できます。
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text.primary,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 8,
    border: `1px solid ${colors.border.strong}`,
    background: colors.bg.page,
    color: colors.text.primary,
    fontSize: 14,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  hint: {
    margin: 0,
    fontSize: 12,
    color: colors.text.muted,
    lineHeight: 1.6,
  },
  link: {
    color: colors.brand.primary,
    marginLeft: 4,
  },
};
