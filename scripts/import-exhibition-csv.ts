import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'csv-parse/sync';

type CsvRow = Record<string, string>;

const FALLBACK_IMAGE_URL = '/import/picture0.jpg';

function normalizeNewlines(input: string): string {
  return (input ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function normalizeInlineText(input: string): string {
  return normalizeNewlines(input)
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeBlockText(input: string): string {
  // 保留段落感：多行 → 单行之间保留一个空行
  const t = normalizeNewlines(input).trim();
  return t.replace(/\n{3,}/g, '\n\n');
}

function splitFirstSentence(text: string): { first: string; rest: string } {
  const t = normalizeBlockText(text);
  if (!t) return { first: '', rest: '' };

  const m = t.match(/^[\s\S]*?[。！？.!?]/);
  if (m?.[0]) {
    const first = m[0].trim();
    const rest = t.slice(m[0].length).trim();
    return { first, rest };
  }

  // 找不到终止符就按第一行拆
  const lines = t.split('\n');
  const firstLineIdx = lines.findIndex(l => l.trim().length > 0);
  const first = (lines[firstLineIdx] ?? '').trim();
  const rest = lines.slice(firstLineIdx + 1).join('\n').trim();
  return { first, rest };
}

function toImageUrls(addressCell: string): string[] {
  const raw = normalizeInlineText(addressCell);
  if (!raw) return [];

  return raw
    .split('|')
    .map(s => s.trim())
    .filter(Boolean)
    .map(p => path.basename(p))
    .filter(Boolean)
    .map(base => `/import/${base}`);
}

function pad(num: number, width: number): string {
  return String(num).padStart(width, '0');
}

async function fileExists(absPath: string): Promise<boolean> {
  try {
    await access(absPath);
    return true;
  } catch {
    return false;
  }
}

function stableUniq<T>(items: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const it of items) {
    if (seen.has(it)) continue;
    seen.add(it);
    out.push(it);
  }
  return out;
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '..'); // .../zhanlan-site

  const csvPath = path.resolve(projectRoot, '..', '展览内容.csv');
  const imagesDir = path.resolve(projectRoot, 'public', 'import');
  const outPath = path.resolve(projectRoot, 'src', 'content', 'exhibitions', 'drafts', 'from-csv.ts');

  const themeTextMap: Record<string, string> = {
    '枕河而居：寺坊周边的家园与烟火': normalizeBlockText(`
运河在这里转了个弯，也在这里孕育了一个家。
天穆村的故事，始于北运河的流淌。先民们逐水而居，建立起最初的村落；两座古老的清真寺，逐渐成为村民生活的中心；那些阡陌交错的胡同里，曾装满了几代人的日常与记忆。
当高楼替代平房，当老街巷融入新城区，改变的是面貌，不变的是根脉。
请随我们走进这段时光长廊，从天穆的缘起开始，聆听这座运河畔村落最初的心跳。
`),
    '舟车辐辏：水陆交汇处的行旅生计': normalizeBlockText(`
天穆村的繁华，盛于北运河的舟楫往来。
漕船载着粮米货殖泊靠码头，马车碾过青石板路扬起尘土，自行车的铃铛声又摇醒了街巷的清晨；那些水陆交织的道口，曾穿梭着南来北往的商客，也承载着一村人的营生与盼头。
当蹄声更迭了橹声，当柏油路覆盖了古道，漫漫长路虽换了新颜，那份为生活奔波的劲头，却岁岁年年，一如既往。
请随我们穿过喧闹的渡口，细数舟车辐辏间的变迁，感受那份独属于天穆的行旅记忆。
`),
    '牛羊嘉馔：慎择惟良处的烟火食事': normalizeBlockText(`
信仰在这里扎根，也在这里滋养出醇厚食韵。
天穆村的滋味，沉淀于“饮食惟良，必慎必择”的坚守里。集市上的牛羊肉透着鲜亮，油香在热锅里舒展金黄，糕点铺的甜气裹住了街巷，古尔邦节的盛宴更暖透了邻里的心房；那些案几间的精挑细选，灶火旁的虔诚烹制，曾慰藉着三餐四季的味蕾，也传承着一脉相承的规矩。
无论是晨光里的叫卖，还是节日里的喧腾，在这唇齿留香间，守住的是手艺，延续的是本真。
请随我们入席这场味觉盛宴，在缭绕的香气中，品味那份藏在严谨里的讲究，与融在烟火中的深情。
`),
    '新月下的成长：科学教育与文艺体育': normalizeBlockText(`
文化在这里生根，也在这里绽放。
天穆村的成长，始于学堂里的琅琅书声。从古老的私塾与经堂，到现代的小学与职校，教育照亮了一代代人的前行之路。
而当知识遇见汗水，便结出了别样的果实——泳池中跃起“穆家军”的身影，毽子在空中划出灵动的弧线，笔墨与音符间流淌着生活的诗意。
请随我们走进踏入“新月”下的沃土，看天穆人如何在传承中学习，在拼搏中成长，书写属于自己的文教篇章。
`)
  };

  const csvText = await readFile(csvPath, 'utf-8');
  const records: CsvRow[] = parse(csvText, {
    bom: true,
    columns: (header: string[]) => header.map(h => String(h ?? '').trim()),
    skip_empty_lines: true,
    relax_column_count: true,
    // CSV 中存在少量“字段内出现孤立引号（"）”的非标准写法；开启 relax_quotes
    // 以避免 csv-parse 将其误判为引号包裹字段从而跨行合并、导致记录数减少。
    relax_quotes: true,
    // CSV 存在混合行结束符（\\r\\n / \\n / \\r），显式声明以避免自动探测错误造成合并行
    record_delimiter: ['\r\n', '\n', '\r']
  });

  const colTheme = '主题(章)';
  const colSubtheme = '次主题(节)';
  const colSource = '馆藏地(出处)';
  const colAddress = '地址';
  const colTitle = '图片标题';
  const colDesc = '图说';

  for (const col of [colTheme, colSubtheme, colSource, colAddress, colTitle, colDesc]) {
    if (!Object.prototype.hasOwnProperty.call(records[0] ?? {}, col)) {
      throw new Error(`CSV 缺少列：${col}（请检查表头是否一致）`);
    }
  }

  // 1) 先生成 artifacts（保持 CSV 顺序）
  const artifacts = records.map((row, idx) => {
    const imageUrls = toImageUrls(row[colAddress]);
    return {
      id: `a-${pad(idx + 1, 4)}`,
      // 注意：多图条目（地址列包含 |）时，图片标题字段经常是“图1/图2...”的多行文本。
      // 为了在“浏览展品”里按图片粒度正确匹配标题，这里保留换行（但会做基础清理）。
      title: normalizeBlockText(row[colTitle]),
      description: normalizeBlockText(row[colDesc]),
      source: normalizeInlineText(row[colSource]),
      imageUrls: imageUrls.length ? imageUrls : [FALLBACK_IMAGE_URL],
      theme: normalizeInlineText(row[colTheme]),
      subtheme: normalizeInlineText(row[colSubtheme])
    };
  });

  // 2) 生成 exhibitions / units（按首次出现顺序）
  const themeOrder: string[] = [];
  const themeToArtifacts = new Map<string, typeof artifacts>();
  for (const art of artifacts) {
    if (!themeToArtifacts.has(art.theme)) {
      themeToArtifacts.set(art.theme, []);
      themeOrder.push(art.theme);
    }
    themeToArtifacts.get(art.theme)!.push(art);
  }

  const exhibitions = themeOrder.map((theme, themeIdx) => {
    const allArts = themeToArtifacts.get(theme)!;

    const subOrder: string[] = [];
    const subToArts = new Map<string, typeof allArts>();
    for (const a of allArts) {
      if (!subToArts.has(a.subtheme)) {
        subToArts.set(a.subtheme, []);
        subOrder.push(a.subtheme);
      }
      subToArts.get(a.subtheme)!.push(a);
    }

    const themeText = themeTextMap[theme];
    if (!themeText) {
      throw new Error(`缺少主题文案：${theme}（请在 themeTextMap 中补齐）`);
    }
    const { first: exDescription, rest: exPrologue } = splitFirstSentence(themeText);

    const units = subOrder.map((sub, subIdx) => {
      const unitArts = subToArts.get(sub)!;
      const { first: unitDesc } = splitFirstSentence(unitArts[0]?.description ?? '');
      return {
        id: `u${pad(themeIdx + 1, 2)}-${pad(subIdx + 1, 2)}`,
        title: sub,
        description: unitDesc || '',
        artifacts: unitArts
      };
    });

    return {
      id: `ex-${pad(themeIdx + 1, 2)}`,
      title: theme,
      description: exDescription || '',
      prologue: exPrologue || '',
      units
    };
  });

  // 3) 校验图片存在性
  const allUrls = stableUniq(artifacts.flatMap(a => a.imageUrls));
  const missing: string[] = [];
  for (const url of allUrls) {
    if (!url.startsWith('/import/')) continue;
    const filename = url.replace('/import/', '');
    const abs = path.resolve(imagesDir, filename);
    if (!(await fileExists(abs))) missing.push(url);
  }

  if (missing.length) {
    const head = missing.slice(0, 30).join('\n');
    throw new Error(
      `发现 ${missing.length} 个缺失图片（示例前 30 个）：\n${head}\n\n请确认已把 picture*. 复制到 zhanlan-site/public/import/。`
    );
  }

  // 4) 写出对照文件（不参与运行时）
  const out = `/* eslint-disable */
/**
 * 该文件由 scripts/import-exhibition-csv.ts 自动生成
 * 数据来源：工作区根目录 /展览内容.csv
 * 图片映射：/import/picture*.jpg (Vite public)
 * 说明：该文件仅用于对照/回溯，不会被运行时引用。
 */
import type { Exhibition, Artifact } from '../../../types';

export const artifacts: Artifact[] = ${JSON.stringify(artifacts, null, 2)} as const;

export const exhibitions: Exhibition[] = ${JSON.stringify(exhibitions, null, 2)} as const;
`;

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, out, 'utf-8');

  // eslint-disable-next-line no-console
  console.log(
    [
      'CSV 导入完成：',
      `- artifacts: ${artifacts.length}`,
      `- exhibitions: ${exhibitions.length}`,
      `- 输出文件: ${path.relative(projectRoot, outPath)}（仅对照，不参与运行时）`
    ].join('\n')
  );
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(String(err?.stack ?? err));
  process.exitCode = 1;
});
