/** YouCam API (Perfect Corp) brand palette — https://yce.perfectcorp.com */
export const colors = {
  brand: {
    primary: "#3385ff",
    primaryHover: "#307ff6",
    primaryActive: "#2e78e9",
    light: "#f5f9ff",
    lightAlt: "#f4fbff",
  },
  accent: {
    cyan: "#03ade2",
    teal: "#1a74a8",
  },
  bg: {
    page: "#ffffff",
    subtle: "#f5f9fa",
    muted: "#f5f6f6",
    card: "#ffffff",
    inset: "#f5f9ff",
  },
  text: {
    primary: "#09161a",
    secondary: "rgba(17, 24, 26, 0.65)",
    muted: "rgba(17, 24, 26, 0.45)",
    footer: "#999999",
  },
  border: {
    default: "rgba(17, 24, 26, 0.1)",
    strong: "rgba(17, 24, 26, 0.2)",
    selected: "#3385ff",
  },
  semantic: {
    success: "#067a57",
    successLight: "#86c4b0",
    successBg: "rgba(10, 204, 146, 0.05)",
    successBorder: "rgba(6, 122, 87, 0.2)",
    error: "#e00000",
    errorLight: "#f87171",
    errorBg: "rgba(222, 0, 0, 0.05)",
    errorBorder: "rgba(222, 0, 0, 0.14)",
    warning: "#fec62e",
    warningBg: "rgba(255, 192, 46, 0.08)",
    warningBorder: "rgba(255, 192, 46, 0.2)",
  },
  score: {
    raw: "#3385ff",
    ui: "#03ade2",
  },
} as const;
