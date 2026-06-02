export const appBase = import.meta.env.BASE_URL || '/';

export function withBase(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  
  // 在Vercel上，我们总是使用绝对路径（以/开头）
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  
  const base = appBase.endsWith('/') ? appBase.slice(0, -1) : appBase;
  if (base && base !== '/' && (path === base || path.startsWith(`${base}/`))) return path;
  return `${base}${path}`;
}
