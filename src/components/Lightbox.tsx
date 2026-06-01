import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type LightboxProps = {
  isOpen: boolean;
  urls: string[];
  index: number;
  title?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
};

export default function Lightbox({
  isOpen,
  urls,
  index,
  title,
  onClose,
  onPrev,
  onNext
}: LightboxProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 聚焦到关闭按钮，给键盘用户一个可见入口
    queueMicrotask(() => closeBtnRef.current?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, onPrev, onNext]);

  const url = urls[index] ?? urls[0];
  const showNav = urls.length > 1 && Boolean(onPrev) && Boolean(onNext);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title ? `图片放大预览：${title}` : '图片放大预览'}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="absolute inset-0 bg-brand-primary/80 backdrop-blur-sm cursor-zoom-out"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative z-10 w-[min(1200px,92vw)]"
          >
            <div className="relative bg-brand-bg/95 border border-brand-primary/10 shadow-2xl overflow-hidden">
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label="关闭"
                  className="w-10 h-10 rounded-full border border-brand-primary/10 bg-brand-bg/90 hover:bg-brand-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/50 focus-visible:outline-offset-2 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {showNav && (
                <>
                  <button
                    type="button"
                    onClick={onPrev}
                    aria-label="上一张"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-brand-primary/10 bg-brand-bg/90 hover:bg-brand-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/50 focus-visible:outline-offset-2 flex items-center justify-center"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    aria-label="下一张"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-brand-primary/10 bg-brand-bg/90 hover:bg-brand-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/50 focus-visible:outline-offset-2 flex items-center justify-center"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              <div className="px-5 pt-5 pb-4 border-b border-brand-primary/10">
                <div className="text-[11px] font-sans tracking-[0.22em] text-brand-muted uppercase">
                  点击空白处或按 ESC 关闭
                </div>
                {title && (
                  <div className="mt-2 font-serif text-[18px] md:text-[20px] text-brand-primary/90 leading-snug">
                    {title}
                  </div>
                )}
              </div>

              <div className="p-4 md:p-6 bg-brand-soft-grey">
                <img
                  src={url}
                  alt={title ?? '图片预览'}
                  className="w-full h-auto max-h-[82vh] object-contain mx-auto shadow-xl"
                  draggable={false}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

