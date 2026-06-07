export interface SkinScoreItem {
  id: string;
  label: string;
  uiScore: number;
  rawScore: number;
  delta: number;
  maskUrl: string | null;
}

export interface AnalysisResult {
  items: SkinScoreItem[];
  biasIndex: number;
  averageDelta: number;
  taskId: string;
}

export interface AnalyzeError {
  error: string;
  code?: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  wrinkle: "シワ",
  pore: "毛穴",
  texture: "キメ",
  acne: "ニキビ",
  moisture: "水分量",
  firmness: "ハリ",
  radiance: "輝き",
  redness: "赤み",
  oiliness: "テカリ",
  age_spot: "シミ",
  dark_circle_v2: "クマ",
  eye_bag: "目袋",
  hd_wrinkle: "シワ (HD)",
  hd_pore: "毛穴 (HD)",
  hd_texture: "キメ (HD)",
  hd_acne: "ニキビ (HD)",
  hd_moisture: "水分量 (HD)",
  hd_firmness: "ハリ (HD)",
  hd_radiance: "輝き (HD)",
  hd_redness: "赤み (HD)",
  hd_oiliness: "テカリ (HD)",
  hd_age_spot: "シミ (HD)",
  hd_dark_circle: "クマ (HD)",
  hd_eye_bag: "目袋 (HD)",
  hd_wrinkle_forehead: "額のシワ",
  hd_wrinkle_glabellar: "眉間のシワ",
  hd_wrinkle_crowfeet: "目尻のシワ",
  hd_wrinkle_periocular: "目周りのシワ",
  hd_wrinkle_nasolabial: "ほうれい線",
  hd_wrinkle_marionette: "マリオネットライン",
  hd_wrinkle_whole: "シワ (全体)",
  hd_pore_forehead: "額の毛穴",
  hd_pore_nose: "鼻の毛穴",
  hd_pore_cheek: "頬の毛穴",
  hd_pore_whole: "毛穴 (全体)",
  wrinkle_periocular: "目周りのシワ",
  wrinkle_whole: "シワ (全体)",
  wrinkle_forehead: "額のシワ",
  wrinkle_glabellar: "眉間のシワ",
  wrinkle_crowfeet: "目尻のシワ",
  wrinkle_nasolabial: "ほうれい線",
  wrinkle_marionette: "マリオネットライン",
  pore_whole: "毛穴 (全体)",
  pore_forehead: "額の毛穴",
  pore_nose: "鼻の毛穴",
  pore_cheek: "頬の毛穴",
};

const REGION_LABELS: Record<string, string> = {
  forehead: "額",
  glabellar: "眉間",
  crowfeet: "目尻",
  periocular: "目周り",
  nasolabial: "ほうれい線",
  marionette: "マリオネット",
  whole: "全体",
  nose: "鼻",
  cheek: "頬",
};

export function labelForType(type: string): string {
  if (CATEGORY_LABELS[type]) return CATEGORY_LABELS[type];

  const normalized = type.replace(/_\d+$/, "");
  if (CATEGORY_LABELS[normalized]) return CATEGORY_LABELS[normalized];

  const parts = normalized.split("_");
  if (parts.length >= 2) {
    const region = parts[parts.length - 1];
    const base = parts.slice(0, -1).join("_");
    if (parts.length >= 3 && parts[parts.length - 1] === parts[parts.length - 2]) {
      const deduped = parts.slice(0, -1).join("_");
      if (CATEGORY_LABELS[deduped]) return CATEGORY_LABELS[deduped];
    }
    const baseLabel = CATEGORY_LABELS[base] ?? base.replace(/^hd_/, "");
    const regionLabel = REGION_LABELS[region];
    if (regionLabel && !baseLabel.includes(regionLabel)) {
      return `${regionLabel}の${baseLabel.replace(/ \(HD\)$/, "").replace(/^hd_/, "")}`;
    }
  }

  return normalized.replace(/^hd_/, "").replace(/_/g, " ");
}

export function computeBiasIndex(items: SkinScoreItem[]): {
  biasIndex: number;
  averageDelta: number;
} {
  if (items.length === 0) {
    return { biasIndex: 0, averageDelta: 0 };
  }
  const deltas = items.map((i) => i.delta);
  const biasIndex = deltas.reduce((a, b) => a + b, 0);
  const averageDelta = biasIndex / items.length;
  return { biasIndex, averageDelta };
}
