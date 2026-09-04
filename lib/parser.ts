/**
 * 문자열/숫자를 '만원' 단위 소수점 1자리(float)로 정규화
 * 예: 135000 -> 13.5, "13.5만원" -> 13.5, "100,000원" -> 10.0
 */
export function parseToManwon(val: string | number): number {
  if (typeof val === 'number') {
    const amount = val >= 1000 ? val / 10000 : val;
    return Math.round(amount * 10) / 10;
  }

  const cleaned = val.replace(/,/g, '').trim();

  const manwonMatch = cleaned.match(/([\d.]+)\s*만\s*원?/);
  if (manwonMatch) {
    return Math.round(parseFloat(manwonMatch[1]) * 10) / 10;
  }

  const rawMatch = cleaned.match(/([\d.]+)/);
  if (rawMatch) {
    const num = parseFloat(rawMatch[1]);
    const amount = num >= 1000 ? num / 10000 : num;
    return Math.round(amount * 10) / 10;
  }

  return 0.0;
}

/**
 * UI 표시용 포맷터: 항상 소수점 1자리 유지 (예: 15 -> "15.0만원")
 */
export function formatManwon(val: number): string {
  return `${Number(val || 0).toFixed(1)}만원`;
}
