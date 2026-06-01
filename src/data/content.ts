/**
 * @deprecated
 * 旧的数据入口。页面已迁移到 `src/content/*`。
 * 这里保留为兼容层，避免外部/历史引用断裂。
 */

// 展厅/展品（已迁移到内容层；这里仅做兼容转发）
export { artifacts, exhibitions } from '../content/exhibitions';

// 站点文案（新入口）
export * from '../content/site';
