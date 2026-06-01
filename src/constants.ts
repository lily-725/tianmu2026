/**
 * 全局动画配置
 * 方便小白用户统一修改全站的入场效果
 */
export const FADE_IN_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 1, 
      delay, 
      ease: [0.16, 1, 0.3, 1] 
    }
  })
};
