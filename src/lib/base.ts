export const appBase = import.meta.env.BASE_URL || '/';

export function withBase(path: string): string {
  if (!path) return path;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  if (!path.startsWith('/')) return path;

  const base = appBase.endsWith('/') ? appBase.slice(0, -1) : appBase;
  return `${base}${path}`;
}

