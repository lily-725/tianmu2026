import React from 'react';
import { motion } from 'motion/react';
import { preface } from '../content';
import { FADE_IN_VARIANTS } from '../constants';

export default function Preface() {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={FADE_IN_VARIANTS}
      custom={0}
      className="flex-1 flex flex-col pt-[22px] max-w-[999px] mx-auto min-h-[calc(100vh-22rem)] w-full"
    >
      <div className="relative mb-8 md:mb-12">
        <motion.span 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-16 -left-12 text-[clamp(6rem,15vw,10rem)] text-brand-deco z-0 font-bold hidden md:block select-none"
          style={{ paddingTop: '-5px', paddingLeft: '2px', paddingBottom: '7px' }}
        >
          终
        </motion.span>
        <h2 
          className="text-fluid-h2 tracking-[0.2em] text-brand-text relative z-10 md:pl-6"
          style={{ paddingLeft: '24px', paddingTop: '40px' }}
        >
          {preface.heading}
        </h2>
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: 64 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-[1px] bg-[#1a1818]/30 mt-6 md:ml-6"
        ></motion.div>
      </div>

      <div className="leading-[1.8] tracking-wide text-justify-zh text-secondary">
        {preface.paragraphs.map((paragraph, idx) => (
          <p key={idx} className="mb-3 md:mb-5 text-lg md:text-[21px] indent-[2em] font-light">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-16 md:mt-24 pt-10 border-t border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0">
         <div className="text-meta">
            {preface.footerLeft}
         </div>
         <div className="text-right italic text-brand-accent font-serif text-sm opacity-80 max-w-xs">
            {preface.footerRight}
         </div>
      </div>
    </motion.div>
  );
}