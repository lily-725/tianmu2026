import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { about } from '../content';
import { FADE_IN_VARIANTS } from '../constants';
import { withBase } from '../lib/base';

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const bgY = useTransform(scrollYProgress, [0, 1], [-150, 150]);

  return (
    <div ref={containerRef} className="max-w-[999px] mx-auto relative">
      <motion.div 
        style={{ y: bgY }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 text-[30rem] font-bold text-brand-accent/[0.03] select-none -z-10 font-serif leading-none"
      >
        穆
      </motion.div>

      {/* 浮动背景图片装饰 */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
          className="absolute top-[20%] -right-24 w-64 h-80 opacity-[0.08] grayscale"
        >
          <img src={withBase('/shuru/tianmudajie1.jpg')} loading="lazy" decoding="async" fetchPriority="low" className="w-full h-full object-cover rounded-sm" alt="" />
        </motion.div>
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, 120]) }}
          className="absolute top-[60%] -left-32 w-72 h-48 opacity-[0.06] grayscale"
        >
          <img src={withBase('/shuru/caoyun1.jpg')} loading="lazy" decoding="async" fetchPriority="low" className="w-full h-full object-cover rounded-sm" alt="" />
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={FADE_IN_VARIANTS}
        className="relative z-10"
      >
        <div className="text-meta mb-6">Introduction</div>
        <h1 className="text-5xl font-serif mb-16 leading-tight">关于天穆</h1>
        <div className="aspect-[21/9] bg-brand-soft-grey mb-10 overflow-hidden shadow-sm group">
           <img src={withBase('/import/0000.png')} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Tianmu View" />
        </div>
        <div className="markdown-body text-secondary relative">
          {about.paragraphs.map((p, idx) => (
            <div key={idx} className="relative group">
              {idx === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="float-right ml-8 mb-6 w-72 h-48 overflow-hidden shadow-md rounded-sm border-4 border-white rotate-2 hidden md:block"
                >
                  <img src={withBase('/shuru/caoyun2.jpg')} loading="lazy" decoding="async" fetchPriority="low" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="历史照片" />
                </motion.div>
              )}
              {idx === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="float-left mr-8 mb-6 w-60 h-80 overflow-hidden shadow-md rounded-sm border-4 border-white -rotate-2 hidden md:block"
                >
                  <img src={withBase('/shuru/beisi1916.jpg')} loading="lazy" decoding="async" fetchPriority="low" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="历史照片" />
                </motion.div>
              )}
              <p className="text-xl leading-relaxed font-light text-justify-zh indent-[2em] mb-8 last:mb-0">
                {p}
              </p>
            </div>
          ))}
          <div className="clear-both" />
        </div>
      </motion.div>
    </div>
  );
};

export default About;
