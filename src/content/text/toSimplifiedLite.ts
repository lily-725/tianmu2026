/**
 * 仅替换“明显繁体字”为简体字（保守策略）
 *
 * 说明：为了避免 OpenCC 在词语层面的误替换（例如把“慰藉”误改为“慰借”），
 * 这里仅做少量、明确的一对一单字替换。
 */
const TRAD_TO_SIMP_LITE: Record<string, string> = {
  '为': '为',
  '伪': '伪',
  '启': '启',
  '图': '图',
  '劃': '划',
  '毁': '毁',
  '刹': '刹',
  '众': '众',
  '弥': '弥',
  '炼': '炼'
};

const TRAD_TO_SIMP_LITE_RE = new RegExp(
  `[${Object.keys(TRAD_TO_SIMP_LITE).join('')}]`,
  'g'
);

export function toSimplifiedLite(input: string): string {
  if (!input) return input;
  return input.replace(TRAD_TO_SIMP_LITE_RE, (ch) => TRAD_TO_SIMP_LITE[ch] ?? ch);
}

