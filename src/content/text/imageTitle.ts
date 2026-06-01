import { toSimplifiedLite } from './toSimplifiedLite';

/**
 * 从 Artifact.title 中解析“按图片序号对应的标题”
 *
 * 背景：一行内容可能对应多张图片（地址列用 | 分隔），图片标题字段常见两种写法：
 * 1) 多行：每行对应一张图（如：第一行标题、第二行标题）
 * 2) 带编号：图1:xxx\n图2:yyy（或图1：xxx 图2：yyy）
 *
 * 若无法可靠解析，则回退为原始 title（将换行压成空格）。
 */
export function getImageTitleForIndex(
  rawTitle: string,
  imageIndex: number,
  totalImages: number
): string {
  const title = toSimplifiedLite((rawTitle ?? ''))
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  const cleanInline = (s: string) =>
    toSimplifiedLite((s ?? ''))
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\s*\n+\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

  if (!title) return '';
  if (totalImages <= 1) return cleanInline(title);

  // 1) 优先解析 “图1:xxx 图2:yyy”
  const numbered: Record<number, string> = {};
  const re = /图\s*(\d+)\s*[:：]\s*([\s\S]*?)(?=(?:\n\s*图\s*\d+\s*[:：])|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(title))) {
    const n = Number(m[1]);
    const t = cleanInline(m[2]);
    if (Number.isFinite(n) && t) numbered[n] = t;
  }

  const nums = Object.keys(numbered)
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  if (nums.length >= totalImages) {
    const t = numbered[imageIndex + 1];
    if (t) return t;
  }

  // 2) 再尝试多行拆分（每行一图）
  const lines = title
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^图\s*\d+\s*[:：]\s*/i, '').trim())
    .filter(Boolean);

  if (lines.length >= totalImages) {
    return cleanInline(lines[imageIndex] ?? title);
  }

  return cleanInline(title);
}

/**
 * 用于正文页：将多图标题汇总成一条展示文案（仅显示一次）
 */
export function getImageTitleSummary(rawTitle: string, totalImages: number): string {
  const title = toSimplifiedLite((rawTitle ?? ''))
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  const cleanInline = (s: string) =>
    toSimplifiedLite((s ?? ''))
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\s*\n+\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

  if (!title) return '';
  if (totalImages <= 1) return cleanInline(title);

  const parts = Array.from({ length: totalImages })
    .map((_, i) => getImageTitleForIndex(title, i, totalImages))
    .filter(Boolean);

  const uniq = Array.from(new Set(parts));
  if (uniq.length === 1) return uniq[0];
  return uniq.join(' / ');
}

