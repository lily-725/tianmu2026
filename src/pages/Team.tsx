import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { team } from '../content';
import { FADE_IN_VARIANTS } from '../constants';
import { withBase } from '../lib/base';

const Team = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const bgY = shouldReduceMotion ? 0 : useTransform(scrollYProgress, [0, 1], [-150, 150]);

  // 统一排版（策展团队页专用）
  const maxProse = 'max-w-[48rem]';
  const roleText = 'text-[14px] md:text-[15px] font-sans font-medium tracking-[0.04em] text-brand-primary/65';
  const nameText = 'text-xl font-serif font-light text-brand-primary/90 leading-relaxed';
  const bodyText = 'text-xl leading-relaxed font-light text-justify-zh indent-[2em] text-brand-primary/70';
  
  return (
    <div ref={containerRef} className="max-w-[999px] mx-auto relative">
      <motion.div 
        style={{ y: bgY }}
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 text-[30rem] font-bold text-brand-accent/[0.03] select-none -z-10 font-serif leading-none"
      >
        团
      </motion.div>

      {/* 背景图片装饰 */}
      <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [50, -150]) }}
          className="absolute top-[10%] -left-40 w-80 h-60 opacity-[0.05] grayscale rotate-12"
        >
          <img src={withBase('/shuru/zupu.jpg')} className="w-full h-full object-cover rounded-lg" alt="" />
        </motion.div>
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 200]) }}
          className="absolute top-[40%] -right-48 w-96 h-72 opacity-[0.04] grayscale -rotate-6"
        >
          <img src={withBase('/shuru/qingshi.jpg')} className="w-full h-full object-cover rounded-lg" alt="" />
        </motion.div>
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], [100, -100]) }}
          className="absolute bottom-[10%] -left-32 w-64 h-80 opacity-[0.05] grayscale -rotate-12"
        >
          <img src={withBase('/shuru/mu1937.jpg')} className="w-full h-full object-cover rounded-lg" alt="" />
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={FADE_IN_VARIANTS}
        className="relative z-10"
      >
        <div className="text-meta mb-6">Credits</div>
        <h1 className="text-5xl font-serif mb-16 leading-tight">策展团队</h1>
        <div className="w-16 h-px bg-brand-accent/40 mb-20"></div>

        <div className="space-y-12 md:space-y-14">
          {/* Curators Section */}
          <section aria-labelledby="team-personnel">
            <h2 id="team-personnel" className="sr-only">人员名录</h2>
            <dl className={`${maxProse} space-y-10`}>
              {team.curators.map((c, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-x-8 gap-y-4 border-b border-brand-primary/[0.05] pb-10 last:border-none"
                >
                  <dt className={roleText}>
                    {c.role}
                  </dt>
                  <dd className="flex flex-wrap gap-x-6 gap-y-3">
                    {c.names.split('，').map((name, i) => (
                      <span key={i} className={nameText}>
                        {name}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <hr aria-hidden="true" className="border-brand-border" />

          {/* Acknowledgments Section */}
          <section aria-labelledby="team-ack">
            <h2 id="team-ack" className="sr-only">致谢</h2>
            <div className={maxProse}>
              {team.acknowledgments.map((para, idx) => (
                <p
                  key={idx}
                  className={`${bodyText} mb-8 last:mb-0`}
                >
                  {para}
                </p>
              ))}
            </div>
          </section>

          <hr aria-hidden="true" className="border-brand-border" />

          {/* Contact Footer */}
          <section aria-labelledby="team-contact" className="pb-12">
            <h2 id="team-contact" className="sr-only">联系方式</h2>
            <address className={`not-italic ${maxProse} flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
              <div className="text-xl font-sans font-light text-brand-primary/70">
                <span className="text-brand-muted mr-4">联系方式：</span>
                <a
                  href={`mailto:${team.contact}`}
                  className="underline underline-offset-4 decoration-brand-accent/30 hover:decoration-brand-accent hover:text-brand-accent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-accent/40 focus-visible:outline-offset-4"
                >
                  {team.contact}
                </a>
              </div>
              <div className="text-xs text-brand-muted font-sans tracking-tighter uppercase opacity-30">
                Tianmu Institutional Archive · 2026
              </div>
            </address>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default Team;
