import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { EXHIBITION_CONFIG } from '../modules/home/config';
import { about } from '../content/site/about';
import { team } from '../content/site/team';
import SiteTopNav from '../components/SiteTopNav';

export default function SiteHome() {
  const { home } = EXHIBITION_CONFIG;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const mapOpacity = useTransform(scrollYProgress, [0, 0.2], [0.12, 0.05]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div ref={containerRef} className="home-module-theme relative w-full bg-parchment overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="map-bg-layer h-full w-full"
          style={{
            backgroundImage: 'url("/ditu/qctj.jpg")',
            opacity: mapOpacity
          }}
        />
        <div className="ink-bleed top-[-10%] left-[-10%]" />
        <div className="ink-bleed bottom-[-10%] right-[-10%]" />
        <div className="paper-texture-overlay h-full w-full" />
        <div className="home-vignette" />
      </div>

      <section className="snap-section relative min-h-[100svh] w-full flex flex-col overflow-hidden">
        <SiteTopNav variant="home" behavior="overlay" />

        <div className="watermark-shadow">1402-</div>

        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[40vw] h-full bg-gradient-to-l from-oldgold/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-parchment to-transparent" />
        </div>

        <div className="home-container relative z-10 flex-1 flex flex-col md:flex-row items-center">
          <motion.div
            style={{ scale: heroScale }}
            className="w-full md:w-3/5 flex flex-col justify-center py-20 md:py-0"
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-12 h-px bg-cinnabar" />
                <span className="text-xs md:text-sm tracking-[0.6em] font-sans uppercase font-bold text-cinnabar">
                  Tianmu Archive
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="hero-title-main font-serif font-bold text-ink mix-blend-multiply"
              >
                {home.mainTitle}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="flex flex-col gap-6 mt-12"
              >
                <div className="hero-accent-line" />
                <h2 className="font-serif text-3xl md:text-5xl text-ink/80 tracking-[7px]">
                  {home.subTitle}
                </h2>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 max-w-[662px]"
            >
              <p className="text-lg md:text-xl leading-[1.8] opacity-70 font-serif font-light text-justify">
                自永乐二年（1404年）至今，天穆村已历六百二十余载。它是运河边的一颗明珠，承载着厚重的民族记忆与时代变迁。
              </p>
              <p className="text-lg md:text-xl leading-[1.8] mt-4 opacity-70 font-serif font-light text-justify">
                循着历史的脉络走进天穆，我们既能读见一个村落因运河而兴、因岁月而丰的成长故事，也能在聚落变迁与文化传承中，感受这片土地绵延不息的生命力。
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="w-full md:w-2/5 flex items-center justify-center md:justify-end py-12 md:py-0"
          >
            <div className="hero-glass-card relative w-full max-w-[460px] p-8 md:p-10 rounded-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-oldgold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="flex flex-col gap-6 relative z-10">
                <Link to="/exhibition" className="portal-entry group">
                  <div className="portal-content flex justify-between items-end">
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-[0.4em] opacity-40 font-sans uppercase">Virtual Exhibition</p>
                      <h3 className="text-3xl font-serif text-ink group-hover:text-cinnabar transition-colors">进入数字展厅</h3>
                      <p className="text-xs opacity-50 font-serif italic">图文展览，走进泊岸生根的故事</p>
                    </div>
                    <ArrowRight className="portal-arrow transition-transform duration-500 opacity-40 group-hover:opacity-100" size={24} />
                  </div>
                </Link>

                <Link to="/map" className="portal-entry group">
                  <div className="portal-content flex justify-between items-end">
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-[0.4em] opacity-40 font-sans uppercase">Cartographic Archive</p>
                      <h3 className="text-3xl font-serif text-ink group-hover:text-cinnabar transition-colors">探索时空地图</h3>
                      <p className="text-xs opacity-50 font-serif italic">互动探索，穿梭六百年时空长廊</p>
                    </div>
                    <ArrowRight className="portal-arrow transition-transform duration-500 opacity-40 group-hover:opacity-100" size={24} />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30 group cursor-pointer"
          onClick={() => {
            const sections = containerRef.current?.querySelectorAll('.snap-section');
            sections?.[1]?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="text-[10px] tracking-[0.8em] font-sans uppercase ml-[0.8em]">Scroll</span>
          <div className="w-px h-16 bg-gradient-to-b from-ink to-transparent" />
        </motion.div>
      </section>

      <section className="snap-section section-container bg-parchment-light/30">
        <div className="home-container">
          <div className="about-content-wrapper">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="about-text-card relative"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 border-r-2 border-t-2 border-cinnabar/20 pointer-events-none" />
              <div className="about-decorative-text">天穆</div>
              <h2 className="text-5xl md:text-6xl font-serif text-ink mb-12">关于天穆</h2>
              <div className="space-y-6">
                {about.paragraphs.map((p, i) => (
                  <p key={i} className="text-lg md:text-xl leading-relaxed text-justify opacity-80 font-serif font-light">
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>

            <div className="about-image-collage relative h-[700px] translate-y-8 md:translate-y-12">
              <motion.div
                initial={{ rotate: -10, x: -24, y: 42, opacity: 0 }}
                whileInView={{ rotate: -7, x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img collage-img--left w-64 h-80 top-5 left-5 z-20"
              >
                <img src="/shuru/tianmudajie1.jpg" alt="天穆大街" className="w-full h-full object-cover transition-all duration-700" />
                <div className="absolute bottom-4 left-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase bg-black/40 px-2 py-1">Tianmu Street</div>
              </motion.div>

              <motion.div
                initial={{ rotate: 14, x: 20, y: -36, opacity: 0 }}
                whileInView={{ rotate: 11, x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img collage-img--right w-62 h-42 top-12 right-10 z-10"
              >
                <img src="/shuru/caoyun1.jpg" alt="漕运记忆" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: 5, scale: 0.84, y: 18, opacity: 0 }}
                whileInView={{ rotate: 2, scale: 1, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img w-60 h-76 top-38 right-16 z-30"
              >
                <img src="/shuru/beisi1916.jpg" alt="清真北寺1916" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: -4, x: -36, y: 20, opacity: 0 }}
                whileInView={{ rotate: -8, x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img collage-img--left w-54 h-56 bottom-18 left-17 z-10"
              >
                <img src="/shuru/caoyun2.jpg" alt="运河漕运" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: 7, scale: 0.92, x: 18, opacity: 0 }}
                whileInView={{ rotate: 9, scale: 1, x: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img collage-img--right w-46 h-62 bottom-2 right-32 z-20"
              >
                <img src="/shuru/tianmuxiaioxue1.jpg" alt="天穆小学" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: -12, opacity: 0, y: 18 }}
                whileInView={{ rotate: -14, opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="collage-img collage-img--ghost w-40 h-28 top-[78%] left-[3%] z-0 opacity-28"
              >
                <img src="/shouye/06.jpg" alt="牛羊业" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="snap-section section-container border-t border-ink/5">
        <div className="home-container">
          <div className="team-content-wrapper">
            <div className="team-image-collage order-2 lg:order-1 relative h-[660px]">
              <motion.div
                initial={{ rotate: 11, x: -18, y: 44, opacity: 0 }}
                whileInView={{ rotate: 7, x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img collage-img--left w-78 h-54 top-4 left-3 z-20"
              >
                <img src="/shouye/1.jpg" alt="清真寺旧影" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: -11, x: 20, y: -34, opacity: 0 }}
                whileInView={{ rotate: -8, x: 0, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img collage-img--right w-78 h-54 bottom-4 right-0 z-10"
              >
                <img src="/shouye/5.jpg" alt="族谱" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: 4, scale: 0.88, y: 18, opacity: 0 }}
                whileInView={{ rotate: 2, scale: 1, y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="collage-img w-70 h-50 top-28 right-16 z-30"
              >
                <img src="/shouye/11.jpg" alt="清真食俗" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: -6, opacity: 0, x: 26, y: 12 }}
                whileInView={{ rotate: -9, opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                className="collage-img collage-img--left w-40 h-52 bottom-14 left-16 z-20"
              >
                <img src="/shouye/4.jpg" alt="穆家庄1937" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>

              <motion.div
                initial={{ rotate: 14, opacity: 0, scale: 0.84 }}
                whileInView={{ rotate: 12, opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="collage-img collage-img--ghost collage-img--right w-42 h-54 top-[50%] left-[32%] z-0 opacity-24"
              >
                <img src="/shouye/2.jpg" alt="牛羊业发展" className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="team-text-card order-1 lg:order-2 relative"
            >
              <div className="absolute -bottom-6 -left-6 w-24 h-24 border-l-2 border-b-2 border-oldgold/20 pointer-events-none" />
              <div className="team-decorative-text text-oldgold/5">鸣谢</div>
              <h2 className="text-5xl md:text-7xl font-serif text-ink mb-12 tracking-tight">特别鸣谢</h2>

              <div className="space-y-6 mb-16">
                <p className="text-lg md:text-xl leading-relaxed text-justify opacity-80 font-serif font-light">
                  {team.acknowledgments[0]}
                </p>
              </div>

              <div className="pt-6 border-t border-ink/10 space-y-6">
                <div className="flex items-center gap-4">
                  <p className="text-xs tracking-[0.4em] font-sans uppercase text-oldgold/80 font-bold">Editorial Team</p>
                  <div className="h-px flex-1 bg-oldgold/10" />
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-x-8 gap-y-4 items-baseline">
                    <span className="text-sm tracking-[0.2em] font-sans text-ink/40 uppercase">策展人员</span>
                    {team.curators[0].names.split('，').map((name, index) => (
                      <motion.span
                        key={name}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                        className="text-lg md:text-xl font-serif text-ink/70"
                      >
                        {name}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-sm md:text-base font-serif text-ink/50 leading-relaxed">
                    {team.acknowledgments[1]}
                  </p>
                </div>
              </div>

              <div className="pt-12 border-t border-ink/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <a href={`mailto:${team.contact}`} className="contact-badge hover:bg-ink hover:text-parchment transition-all duration-500">
                  <Mail size={14} />
                  <span>{team.contact}</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
