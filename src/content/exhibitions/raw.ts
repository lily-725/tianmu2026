// 原始数据聚合层（Draft/Raw）：
// - 展品：src/content/exhibitions/artifacts.ts
// - 展厅/单元：按展厅拆分 src/content/exhibitions/ex-01..ex-04.ts
//
// 注意：本文件不做 canonical（不把 artifactIds 映射为 artifacts），
// canonical 逻辑统一在 index.ts 完成，避免页面层直接面对“可编辑结构”。

import type { ExhibitionDraft } from './types/drafts';
import { rawArtifacts } from './artifacts';
import { ex01 } from './ex-01';
import { ex02 } from './ex-02';
import { ex03 } from './ex-03';
import { ex04 } from './ex-04';

export { rawArtifacts, ex01, ex02, ex03, ex04 };

export const rawExhibitionsDraft: ExhibitionDraft[] = [ex01, ex02, ex03, ex04];
