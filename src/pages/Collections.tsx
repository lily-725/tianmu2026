import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getArtifactCards } from '../content';
import { FADE_IN_VARIANTS } from '../constants';
import { withBase } from '../lib/base';
 

const Collections = () => {
  const [search, setSearch] = useState('');
  const location = useLocation();
  const displayItems = useMemo(() => getArtifactCards(search), [search]);

  return (
    <div className="pb-12 max-w-[999px] mx-auto pt-[1px]">
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24 border-b border-brand-primary/5 pb-12">
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={FADE_IN_VARIANTS}
        >
          <div className="text-meta mb-4">Digital Archive</div>
          <h1 className="text-4xl md:text-5xl font-serif">浏览展陈</h1>
        </motion.div>
        <div className="relative w-full md:w-96 group">
          <input 
            type="text" 
            placeholder="搜索藏品名称或关键词..." 
            className="w-full bg-transparent border-b border-brand-accent/20 py-3 pl-10 focus:border-brand-accent outline-none text-sm transition-all duration-500 font-sans tracking-wide placeholder:text-brand-muted/60"
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-accent/40 group-focus-within:text-brand-accent transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
        {displayItems.map(({ art, url, imageIndex, total, displayTitle }, idx) => (
          <motion.div
            key={`${art.id}-${imageIndex}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={idx * 0.04}
            variants={FADE_IN_VARIANTS}
          >
            <Link
              to={`/collection/${art.id}?img=${imageIndex}`}
              state={{ backTo: location.pathname, backHash: location.hash }}
              className="block relative aspect-square overflow-hidden bg-brand-soft-grey group shadow-sm"
            >
              <img 
                src={withBase(url ?? '/import/picture0.jpg')} 
                alt={displayTitle || art.title} 
                className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/90 transition-all duration-500 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                <p className="text-brand-bg text-sm font-serif mb-3 line-clamp-2 leading-relaxed italic">{displayTitle || art.title}</p>
                <div className="h-px w-6 bg-brand-accent mb-3"></div>
                <p className="text-brand-bg/50 text-[9px] tracking-[0.2em] uppercase font-sans font-bold">
                  Ref: {art.id.toUpperCase()}{total > 1 ? ` · ${String(imageIndex + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}` : ''}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {displayItems.length === 0 && (
        <div className="py-40 text-center font-sans tracking-[0.3em] text-brand-muted text-sm">NO RESULTS FOUND</div>
      )}
    </div>
  );
};

export default Collections;
