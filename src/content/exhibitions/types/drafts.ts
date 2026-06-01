import type { Exhibition, Unit } from '../../../types';

/**
 * 可编辑结构（Draft）
 * - 展品仅在 artifacts.ts 维护一次
 * - 单元仅用 artifactIds 引用展品，避免重复嵌套 Artifact 对象
 */
export type UnitDraft = Omit<Unit, 'artifacts'> & {
  artifactIds: string[];
};

export type ExhibitionDraft = Omit<Exhibition, 'units'> & {
  units: UnitDraft[];
};

