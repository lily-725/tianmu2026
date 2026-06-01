import React from 'react';
import { motion } from 'motion/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Maximize2 } from 'lucide-react';
import { getArtifact, getArtifactOccurrences } from '../content';
import { FADE_IN_VARIANTS } from '../constants';
import { withBase } from '../lib/base';
import { getImageTitleForIndex, toSimplifiedLite } from '../lib/utils';
import Lightbox from '../components/Lightbox';

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const art = id ? getArtifact(id) : undefined;

  const navState = (location.state ?? {}) as { backTo?: string; backHash?: string };
  const backTo = navState.backTo;

  const imgParam = new URLSearchParams(location.search).get('img');
  const imgIndex = imgParam ? Number(imgParam) : 0;
  const safeIndex = Number.isFinite(imgIndex) && imgIndex >= 0 ? imgIndex : 0;
  const mainImage =
    withBase(
      art?.imageUrls?.[safeIndex] ??
      art?.imageUrls?.[0] ??
      '/import/picture0.jpg'
    );

  const urls = art?.imageUrls?.length
    ? art.imageUrls.map((url) => withBase(url))
    : [withBase('/import/picture0.jpg')];
  const displayTitle = art
    ? getImageTitleForIndex(art.title, safeIndex, art.imageUrls?.length ?? 1) || art.title
    : '';
  
  if (!art) return <div className="py-20 text-center font-sans tracking-widest opacity-40">ITEM NOT FOUND</div>;

  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  const setImgIndex = (nextIndex: number) => {
    const n = ((nextIndex % urls.length) + urls.length) % urls.length;
    const params = new URLSearchParams(location.search);
    params.set('img', String(n));
    navigate(
      { pathname: location.pathname, search: `?${params.toString()}` },
      // 保留 state：避免“从正文进入详情页”时丢失 backTo/backHash
      { replace: true, state: location.state }
    );
  };

  const occurrences = getArtifactOccurrences(art.id);
  const backLabel = backTo?.startsWith('/hall') ? '返回正文' : '返回列表';
  const handleBack = () => {
    if (backTo) {
      // 用 POP（history back）恢复上一页滚动位置，保证连贯阅读
      navigate(-1);
      return;
    }
    navigate('/collection');
  };

  return (
    <div className="py-12">
      <Lightbox
        isOpen={isLightboxOpen}
        urls={urls}
        index={safeIndex}
        title={displayTitle}
        onClose={() => setIsLightboxOpen(false)}
        onPrev={urls.length > 1 ? () => setImgIndex(safeIndex - 1) : undefined}
        onNext={urls.length > 1 ? () => setImgIndex(safeIndex + 1) : undefined}
      />

      <div className="max-w-[920px] mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={FADE_IN_VARIANTS}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="w-full text-left relative group cursor-zoom-in"
            aria-label="点击放大图片"
          >
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2 text-brand-primary/40 group-hover:text-brand-primary/70 transition-colors">
              <Maximize2 size={16} />
              <span className="text-[11px] font-sans tracking-[0.22em] uppercase">Zoom</span>
            </div>
            <img
              src={mainImage}
              alt={displayTitle}
              className="w-full h-auto max-h-[72vh] object-contain mx-auto"
            />
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={FADE_IN_VARIANTS}
          className="mt-10 md:mt-12"
        >
          {/* 下方信息：名称 → 来源 → 图说 → 对应章节（仅展示，不跳转） */}
          <h1 className="text-2xl md:text-3xl font-serif font-light leading-snug text-brand-primary/90">
            {displayTitle}
          </h1>

          <div className="mt-6 space-y-8">
            <div>
              <div className="text-meta text-brand-accent mb-2">图片来源</div>
              <p className="text-lg font-light leading-relaxed text-brand-primary/70">
                {toSimplifiedLite(art.source)}
              </p>
            </div>

            <div>
              <div className="text-meta text-brand-accent mb-2">图说</div>
              <p className="text-lg font-light leading-[2] text-brand-primary/70 text-justify-zh indent-[2em]">
                {toSimplifiedLite(art.description)}
              </p>
            </div>

            {occurrences.length > 0 && (
              <div>
                <div className="text-meta text-brand-accent mb-2">专题展览</div>
                <ul className="space-y-2 text-lg font-light leading-relaxed text-brand-primary/70">
                  {occurrences.map((o) => (
                    <li key={`${o.exId}/${o.unitId}`}>
                      {toSimplifiedLite(o.exTitle)} · {toSimplifiedLite(o.unitTitle)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-12">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex items-center text-[10px] font-sans font-bold tracking-[0.3em] uppercase hover:text-brand-accent transition-colors"
            >
              <ChevronLeft size={16} className="mr-3 group-hover:-translate-x-2 transition-transform" />
              {backTo ? backLabel : 'Back to Archive'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollectionDetail;
