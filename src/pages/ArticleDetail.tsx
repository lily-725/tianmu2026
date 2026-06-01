import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { exhibitions } from '../content';
import { FADE_IN_VARIANTS } from '../constants';
import { withBase } from '../lib/base';
import { getImageTitleForIndex, toSimplifiedLite } from '../lib/utils';

type GroupedImage = {
  artId: string;
  src: string;
  imageIndex: number;
  title: string;
};

type GroupedEntry = {
  entryIds: string[];
  description: string;
  images: GroupedImage[];
};

function normalizeDescription(text: string) {
  return toSimplifiedLite(text ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

const ArticleDetail = () => {
  const { exId, unitId } = useParams<{ exId: string; unitId: string }>();
  const location = useLocation();

  const ex = exhibitions.find(e => e.id === exId);
  const unit = ex?.units.find(u => u.id === unitId);
  const unitIndex = ex?.units.findIndex(u => u.id === unitId) ?? -1;
  const prevUnit = unitIndex > 0 ? ex?.units[unitIndex - 1] : undefined;
  const nextUnit = unitIndex >= 0 && ex && unitIndex < ex.units.length - 1 ? ex.units[unitIndex + 1] : undefined;
  
  if (!unit) return <div className="py-20 text-center font-sans tracking-widest text-brand-muted">ITEM NOT FOUND</div>;

  // 从藏品详情“返回正文”时，通过 hash 精准回到对应条目
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;
    // 等一帧，确保布局稳定
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }, [location.hash]);

  const groupedEntries = React.useMemo<GroupedEntry[]>(() => {
    const groups: GroupedEntry[] = [];
    const indexByDescription = new Map<string, number>();

    for (const art of unit.artifacts) {
      const key = normalizeDescription(art.description);
      const imgs = (art.imageUrls?.length ? art.imageUrls : ['/import/picture0.jpg'])
        .map((url) => withBase(url))
        .slice(0, 6);
      const imageItems: GroupedImage[] = imgs.map((src, imageIndex) => ({
        artId: art.id,
        src,
        imageIndex,
        title:
          getImageTitleForIndex(art.title, imageIndex, imgs.length) || toSimplifiedLite(art.title),
      }));

      const existingIndex = indexByDescription.get(key);

      if (existingIndex == null) {
        groups.push({
          entryIds: [art.id],
          description: art.description,
          images: imageItems,
        });
        indexByDescription.set(key, groups.length - 1);
      } else {
        groups[existingIndex].entryIds.push(art.id);
        groups[existingIndex].images.push(...imageItems);
      }
    }

    return groups;
  }, [unit.artifacts]);

  return (
    <div className="max-w-[999px] mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={FADE_IN_VARIANTS}
      >
        <div className="mb-20 text-center">
          <Link to={`/hall/${exId}`} className="text-meta hover:text-brand-accent mb-6 inline-block transition-colors tracking-[0.3em] font-bold">← 返回专题目录</Link>
          <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">{toSimplifiedLite(unit.title)}</h1>
          <div className="w-16 h-[2px] bg-brand-accent/40 mx-auto mt-8"></div>
        </div>
      </motion.div>

      {/* 图文呈现：文字优先（先图说，后图片；多图并排） */}
      <div className="space-y-16 md:space-y-20">
        {groupedEntries.map((entry, idx) => {
          const imgs = entry.images;
          const cols =
            imgs.length >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
            imgs.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
            'grid-cols-1';

          const backTo = `${location.pathname}${location.search}`;
          const titleSummary = Array.from(new Set(imgs.map((img) => img.title).filter(Boolean))).join(' / ');

          return (
          <motion.div
            key={entry.entryIds[0]}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0.1}
            variants={FADE_IN_VARIANTS}
          >
            <article
              className="pb-16 md:pb-20 border-b border-brand-primary/5 last:border-b-0 last:pb-0 scroll-mt-24"
            >
              {entry.entryIds.map((entryId) => (
                <div key={entryId} id={`entry-${entryId}`} className="block h-0 scroll-mt-24" aria-hidden="true" />
              ))}
              <div className="px-4 md:px-0">
                <div className="flex items-center justify-between gap-6 mb-6">
                  <div className="text-[10px] font-sans font-bold tracking-[0.28em] uppercase text-brand-muted/50">
                    Entry {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] font-sans font-bold tracking-[0.28em] uppercase text-brand-muted/40">
                    {entry.entryIds[0].toUpperCase()}
                  </div>
                </div>

                {/* 文字主呈现：先图说 */}
                <p className="text-[16px] md:text-[17px] leading-[2.05] text-brand-primary/80 font-light text-justify-zh indent-[2em]">
                  {toSimplifiedLite(entry.description)}
                </p>

                {/* 图片：放在文字下方，居中，且不要很大；多图并排 */}
                <div className="mt-10">
                  <div className={`grid ${cols} gap-6 md:gap-8 justify-items-center max-w-3xl mx-auto`}>
                    {imgs.map((img, i) => (
                      <figure
                        key={`${img.artId}-${img.imageIndex}-${i}`}
                        className="w-full"
                        style={{ maxWidth: imgs.length === 1 ? 680 : 520 }}
                      >
                        <Link
                          to={`/collection/${img.artId}?img=${img.imageIndex}`}
                          state={{ backTo, backHash: `#entry-${img.artId}` }}
                          className="block w-full hover:opacity-95 transition-opacity"
                        >
                          <img
                            src={img.src}
                            alt={img.title}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            className="w-full h-auto max-h-[240px] md:max-h-[320px] object-contain mx-auto"
                          />
                        </Link>
                      </figure>
                    ))}
                  </div>
                  {/* 图片标题：单张放在图下，多张仅写一次放在整组最下方 */}
                  <div className="mt-4 text-center text-[12px] md:text-[13px] text-brand-muted/70 font-light max-w-3xl mx-auto">
                    {titleSummary}
                  </div>
                </div>

              </div>
            </article>
          </motion.div>
          );
        })}
      </div>

      <div className="mt-24 md:mt-40 pt-10 md:pt-20 border-t border-brand-primary/5 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-0 text-meta font-bold">
         {prevUnit ? (
           <Link
             to={`/hall/${exId}/${prevUnit.id}`}
             className="flex items-center text-brand-muted hover:text-brand-accent transition-colors group order-2 md:order-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/40 focus-visible:outline-offset-4 rounded-sm"
           >
             <ChevronLeft size={16} aria-hidden="true" className="mr-2 group-hover:-translate-x-2 transition-transform" />
             上一单元
           </Link>
         ) : (
           <span className="flex items-center text-brand-muted/40 cursor-not-allowed order-2 md:order-1">
             <ChevronLeft size={16} aria-hidden="true" className="mr-2" />
             上一单元
           </span>
         )}
         <Link to={`/hall/${exId}`} className="hover:text-brand-accent transition-colors tracking-[0.28em] px-8 py-3 border border-brand-primary/10 hover:border-brand-accent rounded-full order-1 md:order-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/40 focus-visible:outline-offset-4">返回目录</Link>
         {nextUnit ? (
           <Link
             to={`/hall/${exId}/${nextUnit.id}`}
             className="flex items-center text-brand-muted hover:text-brand-accent transition-colors group order-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/40 focus-visible:outline-offset-4 rounded-sm"
           >
             下一单元
             <ChevronRight size={16} aria-hidden="true" className="ml-2 group-hover:translate-x-2 transition-transform" />
           </Link>
         ) : (
           <span className="flex items-center text-brand-muted/40 cursor-not-allowed order-3">
             下一单元
             <ChevronRight size={16} aria-hidden="true" className="ml-2" />
           </span>
         )}
      </div>
    </div>
  );
};

export default ArticleDetail;
