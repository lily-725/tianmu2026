import type { Artifact, Exhibition } from '../../types';
import type { ExhibitionDraft, UnitDraft } from './types/drafts';
import { rawArtifacts, rawExhibitionsDraft } from './raw';
import { toSimplifiedLite } from '../text/toSimplifiedLite';
import { getImageTitleForIndex } from '../text/imageTitle';
import { withBase } from '../../lib/base';

// ---- Canonical stores (normalized in memory) ----

function ensureImageUrls(a: Artifact): string[] {
  const urls = a.imageUrls?.length ? a.imageUrls : ['/import/picture0.jpg'];
  return urls.map((url) => withBase(url));
}

/**
 * 统一对外提供的 artifacts（以 rawArtifacts 为准）
 * - 仅做 imageUrls fallback，不改动文本
 */
export const artifacts: Artifact[] = (rawArtifacts as Artifact[]).map((a) => ({
  ...a,
  imageUrls: ensureImageUrls(a)
}));

const artifactById = new Map<string, Artifact>(artifacts.map((a) => [a.id, a]));

/**
 * 对外提供的 exhibitions（以 artifacts 表为唯一真源“重组”每个 unit.artifacts）
 * 目的：unit 内仅存 artifactIds（可编辑结构），运行时统一映射回 Artifact[]。
 */
export const exhibitions: Exhibition[] = (rawExhibitionsDraft as ExhibitionDraft[]).map((ex) => ({
  ...ex,
  units: ex.units.map((u: UnitDraft) => {
    const missing: string[] = [];
    const artifactsInUnit: Artifact[] = u.artifactIds
      .map((id) => {
        const a = artifactById.get(id);
        if (!a) missing.push(id);
        return a;
      })
      .filter(Boolean) as Artifact[];

    if (missing.length) {
      throw new Error(
        `展览内容缺失展品引用：${ex.id}/${u.id} missing=${missing.join(', ')}`
      );
    }

    const { artifactIds: _artifactIds, ...rest } = u;
    return { ...rest, artifacts: artifactsInUnit };
  })
}));

// ---- Query helpers (页面未来建议调用这些，而不是自己写逻辑) ----

export function getAllArtifacts(): Artifact[] {
  return artifacts;
}

export function getArtifact(id: string): Artifact | undefined {
  return artifacts.find((a) => a.id === id);
}

export function getExhibitions(): Exhibition[] {
  return exhibitions;
}

export function getExhibition(exId: string): Exhibition | undefined {
  return exhibitions.find((e) => e.id === exId);
}

export type ArtifactOccurrence = {
  exId: string;
  exTitle: string;
  unitId: string;
  unitTitle: string;
};

const occurrenceByArtifactId: Map<string, ArtifactOccurrence[]> = (() => {
  const map = new Map<string, ArtifactOccurrence[]>();
  const seen = new Map<string, Set<string>>(); // artifactId -> set(exId/unitId)

  for (const ex of exhibitions) {
    for (const unit of ex.units) {
      for (const a of unit.artifacts) {
        const key = `${ex.id}/${unit.id}`;
        const s = seen.get(a.id) ?? new Set<string>();
        if (s.has(key)) continue;
        s.add(key);
        seen.set(a.id, s);

        const arr = map.get(a.id) ?? [];
        arr.push({
          exId: ex.id,
          exTitle: ex.title,
          unitId: unit.id,
          unitTitle: unit.title
        });
        map.set(a.id, arr);
      }
    }
  }

  return map;
})();

export function getArtifactOccurrences(artifactId: string): ArtifactOccurrence[] {
  return occurrenceByArtifactId.get(artifactId) ?? [];
}

/**
 * 浏览展品：按“图片”为粒度展开（保持现有 UI 行为）
 */
export function getArtifactCards(query: string): Array<{
  art: Artifact;
  url: string;
  imageIndex: number;
  total: number;
  displayTitle: string;
}> {
  const q = toSimplifiedLite(query ?? '');
  const filtered = artifacts.filter((a) => {
    const t = toSimplifiedLite(a.title);
    const d = toSimplifiedLite(a.description);
    return t.includes(q) || d.includes(q);
  });

  return filtered.flatMap((art) => {
    const urls = ensureImageUrls(art);
    return urls.map((url, imageIndex) => ({
      art,
      url,
      imageIndex,
      total: urls.length,
      displayTitle: getImageTitleForIndex(art.title, imageIndex, urls.length) || art.title
    }));
  });
}
