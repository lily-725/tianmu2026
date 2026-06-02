export const appBase = import.meta.env.BASE_URL || '/';

export function withBase(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  
  // 确保路径以/开头
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  // 在Vercel上，base是'/'，所以直接返回路径
  // 避免重复添加base路径
  const base = appBase.endsWith('/') ? appBase.slice(0, -1) : appBase;
  
  // 如果base是空或者'/'，直接返回路径
  if (!base || base === '/') {
    return path;
  }
  
  // 如果路径已经以base开头，直接返回
  if (path.startsWith(`${base}/`) || path === base) {
    return path;
  }
  
  // 否则添加base前缀
  return `${base}${path}`;
}
