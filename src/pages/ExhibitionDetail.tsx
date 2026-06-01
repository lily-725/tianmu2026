import React from 'react';
import { motion } from 'motion/react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { exhibitions } from '../content';
import { FADE_IN_VARIANTS } from '../constants';
import { toSimplifiedLite } from '../lib/utils';

const ExhibitionDetail = () => {
  const { exId } = useParams<{ exId: string }>();
  const ex = exhibitions.find(e => e.id === exId);
  
  if (!ex) return <div className="py-20 text-center font-sans tracking-widest opacity-40">ITEM NOT FOUND</div>;

  const variantStyles = {
    A: {
      outer: 'px-6 md:px-14 lg:px-24',
      inner: 'max-w-[980px]',
      header: 'mb-14 md:mb-16 max-w-[42rem]',
      h1: 'text-3xl md:text-4xl mb-6 md:mb-7 leading-[1.15]',
      prologue: 'text-lg md:text-[18px] leading-[1.9] pl-5 md:pl-6',
      row: 'py-7 md:py-8 min-h-[4.25rem]',
      rowGap: 'gap-4 md:gap-7',
      title: 'text-lg md:text-2xl',
      button: 'w-10 h-10 md:w-11 md:h-11',
    },
    B: {
      outer: 'px-8 md:px-16 lg:px-28',
      inner: 'max-w-[920px]',
      header: 'mb-14 md:mb-16 max-w-[40rem]',
      h1: 'text-2xl md:text-3xl mb-5 md:mb-6 leading-[1.16]',
      prologue: 'text-lg md:text-[18px] leading-[1.95] pl-5 md:pl-6',
      row: 'py-6 md:py-7 min-h-[4rem]',
      rowGap: 'gap-3 md:gap-6',
      title: 'text-base md:text-xl',
      button: 'w-9 h-9 md:w-10 md:h-10',
    },
    C: {
      outer: 'px-10 md:px-20 lg:px-32',
      inner: 'max-w-[860px]',
      header: 'mb-12 md:mb-14 max-w-[38rem]',
      h1: 'text-2xl md:text-[28px] mb-5 leading-[1.18]',
      prologue: 'text-[17px] md:text-[19px] leading-[1.95] pl-4 md:pl-5',
      row: 'py-5 md:py-6 min-h-[3.75rem]',
      rowGap: 'gap-3 md:gap-5',
      title: 'text-[15px] md:text-lg',
      button: 'w-9 h-9',
    },
  } as const;

  const styles = variantStyles.B;

  return (
    <div className={styles.outer}>
      <div className={`mx-auto pt-4 md:pt-6 pb-8 md:pb-10 ${styles.inner}`}>
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={FADE_IN_VARIANTS}
        >
          <div className={styles.header}>
            <div className="text-meta mb-4">Themes</div>
            <h1 className={`font-serif ${styles.h1}`}>
              {toSimplifiedLite(ex.title)}
            </h1>
            <p className={`font-light text-brand-muted border-l border-brand-accent/30 ${styles.prologue}`}>
              {toSimplifiedLite(ex.prologue)}
            </p>
          </div>
        </motion.div>

        <div className="border-t border-brand-primary/5">
          {ex.units.map((unit, idx) => (
            <motion.div
              key={unit.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx * 0.1}
              variants={FADE_IN_VARIANTS}
            >
              <Link
                to={`/hall/${ex.id}/${unit.id}`}
                className={`flex justify-between items-center border-b border-brand-primary/5 group transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/40 focus-visible:outline-offset-4 ${styles.row}`}
              >
                <div className={`flex items-center ${styles.rowGap}`}>
                  <span className="text-[11px] font-sans font-bold tracking-[0.3em] opacity-30 group-hover:opacity-100 group-hover:text-brand-accent transition-colors duration-500">
                    0{idx + 1}
                  </span>
                  <h2 className={`font-serif font-light tracking-normal transition-colors duration-500 group-hover:text-brand-accent ${styles.title}`}>
                    {toSimplifiedLite(unit.title)}
                  </h2>
                </div>
                <div className={`flex items-center justify-center border border-brand-primary/5 group-hover:border-brand-accent group-hover:bg-brand-accent group-hover:text-brand-bg transition-colors duration-500 rounded-full overflow-hidden ${styles.button}`}>
                  <ArrowRight
                    aria-hidden="true"
                    size={18}
                    className="-translate-x-1 group-hover:translate-x-0 transition-transform duration-500"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetail;
