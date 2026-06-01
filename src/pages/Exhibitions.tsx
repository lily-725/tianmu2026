import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { exhibitions } from '../content';
import { FADE_IN_VARIANTS } from '../constants';
import { withBase } from '../lib/base';
import { toSimplifiedLite } from '../lib/utils';

const Exhibitions = () => (
  <div className="pb-12 max-w-[999px] mx-auto pt-[1px]">
    <motion.div
      initial="hidden"
      animate="visible"
      custom={0}
      variants={FADE_IN_VARIANTS}
    >
      <div className="mb-20">
        <div className="text-meta mb-4">Exhibition Halls</div>
        <h1 className="text-4xl md:text-5xl font-serif">漫步展厅</h1>
      </div>
    </motion.div>
    
    <div className="space-y-16 md:space-y-24">
      {exhibitions.map((ex, idx) => (
        <motion.div
          key={ex.id}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={idx * 0.15}
          variants={FADE_IN_VARIANTS}
        >
          <Link to={`/hall/${ex.id}`} className="group block">
            <div className="flex flex-col md:flex-row gap-10 md:gap-24 items-start">
              <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden bg-brand-soft-grey relative">
                <img 
                  src={withBase(ex.coverImage ?? ex.units[0]?.artifacts[0]?.imageUrls?.[0] ?? '/import/picture0.jpg')} 
                  alt={toSimplifiedLite(ex.title)} 
                  className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="w-full md:w-2/3 pt-4">
                <div className="text-meta mb-6 text-brand-accent">Chapter 0{idx + 1}</div>
                <h2 className="text-3xl md:text-4xl font-serif mb-8 group-hover:text-brand-accent transition-colors duration-500">{toSimplifiedLite(ex.title)}</h2>
                <p className="hero-text mb-10 text-secondary">{toSimplifiedLite(ex.description)}</p>
                <div className="flex items-center text-xs font-bold tracking-[0.25em] uppercase group-hover:text-brand-accent transition-colors duration-500 text-brand-muted">
                  进入专题 <ArrowRight size={14} className="ml-3 group-hover:translate-x-2 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
);

export default Exhibitions;
