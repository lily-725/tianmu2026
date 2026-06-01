import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * 路由滚动行为管理
 *
 * 1) 前进到新页面（PUSH/REPLACE）：滚动到顶部
 * 2) 返回/前进（POP，即浏览器后退/前进或 navigate(-1)）：恢复离开时的滚动位置
 *
 * 注意：
 * - 仅监听 pathname 变化：避免像 /collection/:id?img= 这种“切图”把用户拉回顶部
 * - 若存在 hash（#xxx）：优先滚动到锚点
 */
export default function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType(); // POP | PUSH | REPLACE
  const storageKey = `scroll:${location.key}`;

  useEffect(() => {
    // 进入该路由后：决定滚动位置
    if (location.hash) {
      // hash 优先：滚动到锚点
      requestAnimationFrame(() => {
        const el = document.querySelector(location.hash);
        el?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    } else if (navType === 'POP') {
      const y = sessionStorage.getItem(storageKey);
      if (y != null) window.scrollTo({ top: Number(y) || 0, left: 0, behavior: 'auto' });
      else window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }

    // 离开该路由前：保存滚动位置（供返回时恢复）
    return () => {
      sessionStorage.setItem(storageKey, String(window.scrollY || 0));
    };
  }, [location.pathname]);

  return null;
}
