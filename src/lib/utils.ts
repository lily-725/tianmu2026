import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export { toSimplifiedLite, getImageTitleForIndex, getImageTitleSummary } from '../content/text';

/**
 * 合并 Tailwind CSS 类名的工具函数
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
