import type { SkinScoreItem } from "@/lib/types";

export function describeItemBias(item: SkinScoreItem): string {
  const abs = Math.abs(item.delta);
  if (abs < 0.5) {
    return "測定値と表示用スコアはほぼ同じです。";
  }

  const points = abs >= 1 ? `${abs.toFixed(1)}点` : "わずかに";

  if (item.delta > 0) {
    return `同じ検出結果のまま、表示用スコアだけ${points}上げています。`;
  }
  return `同じ検出結果のまま、表示用スコアだけ${points}下げています。`;
}

export function describeOverallBias(
  biasIndex: number,
  inflated: number,
  deflated: number,
): string {
  const total = inflated + deflated;
  if (total === 0) {
    return "今回の解析では、測定値と表示用スコアに差はありませんでした。";
  }

  const direction =
    biasIndex > 0
      ? "表示用スコアの方が全体的に高め"
      : biasIndex < 0
        ? "表示用スコアの方が全体的に低め"
        : "上げる項目と下げる項目が拮抗";

  return `APIは${total}項目で測定値と表示用スコアを分けて返しました。${direction}に調整されています。`;
}

export function biasDirectionLabel(delta: number): string {
  if (delta > 0.5) return "表示を上げた";
  if (delta < -0.5) return "表示を下げた";
  return "ほぼ一致";
}
