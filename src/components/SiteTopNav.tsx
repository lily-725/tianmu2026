import { AnimatePresence, motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TianmuMark from './TianmuMark';

type SiteTopNavVariant = 'home' | 'exhibition' | 'map';
type SiteTopNavBehavior = 'overlay' | 'sticky';

interface SiteTopNavProps {
  variant?: SiteTopNavVariant;
  behavior?: SiteTopNavBehavior;
  className?: string;
}

const BRAND_BY_VARIANT: Record<SiteTopNavVariant, { title: string; subtitle: string }> = {
  home: {
    title: '天穆地方史',
    subtitle: 'Local History Archive',
  },
  exhibition: {
    title: '天穆地方史',
    subtitle: 'Local History Archive',
  },
  map: {
    title: '天穆地方史',
    subtitle: 'Local History Archive',
  },
};

const EXHIBITION_PATHS = ['/exhibition', '/foreword', '/hall', '/collection', '/team'];

const NAV_ITEMS = [
  { label: '首页', to: '/', match: (pathname: string) => pathname === '/' },
  { label: '展览', to: '/exhibition', match: (pathname: string) => EXHIBITION_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) },
  { label: '地图', to: '/map', match: (pathname: string) => pathname === '/map' || pathname.startsWith('/map/') },
];

export default function SiteTopNav({
  variant = 'exhibition',
  behavior = 'sticky',
  className = '',
}: SiteTopNavProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeItem = useMemo(
    () => NAV_ITEMS.find((item) => item.match(location.pathname))?.label ?? '',
    [location.pathname]
  );
  const brand = BRAND_BY_VARIANT[variant];

  return (
    <>
      <div
        className={`site-top-nav site-top-nav--${variant} site-top-nav--${behavior} ${className}`.trim()}
      >
        <div className="site-top-nav__inner">
          <Link to="/" className="site-top-nav__brand" aria-label="返回首页">
            <span className="site-top-nav__brand-mark">
              <TianmuMark />
            </span>
            <span className="site-top-nav__brand-copy">
              <span className="site-top-nav__brand-title">{brand.title}</span>
              <span className="site-top-nav__brand-subtitle">{brand.subtitle}</span>
            </span>
          </Link>

          <div className="site-top-nav__right-wrapper">
            <nav className="site-top-nav__desktop" aria-label="站点主导航">
              {NAV_ITEMS.map((item) => {
                const isActive = activeItem === item.label;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`site-top-nav__link ${isActive ? 'is-active' : ''}`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.span
                        layoutId="site-top-nav-active-pill"
                        className="site-top-nav__link-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              className="site-top-nav__toggle"
              aria-expanded={isOpen}
              aria-label={isOpen ? '关闭站点导航' : '打开站点导航'}
              onClick={() => setIsOpen((value) => !value)}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`site-top-nav__mobile-shell site-top-nav__mobile-shell--${variant}`}
            aria-label="关闭站点导航"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="site-top-nav__mobile-panel"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="site-top-nav__mobile-header">
                <div>
                  <p className="site-top-nav__mobile-kicker">TIANMU DIGITAL ARCHIVE</p>
                  <h2 className="site-top-nav__mobile-title">站点导航</h2>
                </div>
                <button
                  type="button"
                  className="site-top-nav__mobile-close"
                  aria-label="关闭站点导航"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="site-top-nav__mobile-nav" aria-label="移动端站点主导航">
                {NAV_ITEMS.map((item, index) => {
                  const isActive = activeItem === item.label;
                  return (
                    <motion.div
                      key={item.to}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className={`site-top-nav__mobile-link ${isActive ? 'is-active' : ''}`}
                      >
                        <span className="site-top-nav__mobile-link-label">{item.label}</span>
                        <span className="site-top-nav__mobile-link-meta">
                          {item.to === '/' ? 'Landing' : item.to.replace('/', '').toUpperCase()}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
