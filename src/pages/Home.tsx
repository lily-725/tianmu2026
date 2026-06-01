import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FADE_IN_VARIANTS } from '../constants';
import { withBase } from '../lib/base';

const Home = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col justify-center relative pb-12 min-h-[calc(100vh-22rem)]">
      {/* 装饰性背景 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div 
          style={{ y: bgY }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] text-[clamp(20rem,40vw,48rem)] font-bold text-brand-accent/[0.04] select-none font-serif whitespace-nowrap"
        >
          天穆
        </motion.div>
      </div>
    
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-24">
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={FADE_IN_VARIANTS}
        className="relative z-10 lg:w-[55%]"
      >
        <div className="flex items-center gap-6 mb-10">
          <div className="text-meta">Since 1404</div>
          <div className="h-px w-12 bg-brand-primary/10"></div>
        </div>
        
        <h1 className="text-fluid-h1 mb-16 tracking-[0.08em] font-light leading-[1.1]">
          泊岸 <span className="text-brand-accent/40 mx-3 font-serif">·</span> 生根
        </h1>
        
        <div className="flex flex-col gap-2 md:gap-4 max-w-4xl">
          <p className="hero-text text-brand-muted">
            运河水奔流不息，岁月沿着波纹铺展成诗。六百年间，一代代人驻足、栖息、耕耘、创造，终将一处地理的经纬，沉淀为精神的故乡。
          </p>
          <p className="hero-text text-brand-muted">
            本展览将带您走进天穆——一个因运河蜿蜒而孕育，因舟车辐辏而兴盛，因信仰与生活而丰盈的独特家园。透过屋檐下的烟火、渡口的喧嚣、餐桌上的醇厚与学堂里的灯火，去触摸那在时间流变中始终搏动的脉搏，去理解一片土地如何塑造一群人，一群人又如何定义一片土地。
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-16 mt-10 md:mt-16 max-w-4xl">
          {[
            { label: '历史跨度', val: '600', unit: 'Years' },
            { label: '收录藏品', val: '118', unit: 'Pieces' },
            { label: '展览单元', val: '04', unit: 'Units' }
          ].map((item, i) => (
            <motion.div 
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              className="group cursor-default"
            >
              <div className="text-meta mb-4">
                {item.label}
              </div>
              <div className="text-4xl md:text-6xl font-light text-brand-primary font-serif tracking-widest flex items-baseline gap-3">
                <span className="text-brand-accent">
                  {item.val}
                </span>
                <span className="text-[11px] uppercase font-sans tracking-[0.25em] text-brand-muted font-bold">{item.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="lg:w-[35%] lg:pt-24 mt-12 lg:mt-0"
      >
        <Link to="/hall" className="block relative group max-w-sm mx-auto lg:ml-auto">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-brand-soft-grey shadow-lg">
            <img 
              src={withBase('/import/tianmu.png')} 
              alt="Heritage View" 
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[1500ms]"
            />
            
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 text-white">
               <div className="mb-4 text-[10px] tracking-[0.4em] uppercase opacity-70">Entrance</div>
               <h3 className="text-2xl font-serif mb-8 tracking-widest">漫步展览</h3>
               <div className="w-12 h-px bg-white/40 mb-8"></div>
               <div className="border border-white/20 px-6 py-3 rounded-full flex items-center gap-3 hover:bg-white hover:text-black transition-all duration-300">
                  <span className="text-[12px] font-bold tracking-[0.2em] font-sans">进入数字展厅</span>
                  <ArrowRight size={14} />
               </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  </div>
  );
};

export default Home;
