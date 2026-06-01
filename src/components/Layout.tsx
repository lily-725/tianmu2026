import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SiteTopNav from './SiteTopNav';

interface LayoutProps {
  children: ReactNode;
}

function getExhibitionContext(pathname: string) {
  if (pathname.startsWith('/hall/')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 3) {
      return {
        sectionLabel: '展品单元',
        sectionMeta: '当前位于专题单元详情',
        backLabel: '返回专题详情',
        backPath: `/hall/${segments[1]}`,
      };
    }
    if (segments.length === 2) {
      return {
        sectionLabel: '专题详情',
        sectionMeta: '当前位于展厅专题页',
        backLabel: '返回漫步展厅',
        backPath: '/hall',
      };
    }
  }

  if (pathname.startsWith('/collection/')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      return {
        sectionLabel: '藏品详情',
        sectionMeta: '当前位于浏览展陈单件藏品',
        backLabel: '返回浏览展陈',
        backPath: '/collection',
      };
    }
  }

  if (pathname === '/hall') {
    return {
      sectionLabel: '漫步展厅',
      sectionMeta: '浏览专题与单元脉络',
      backLabel: '返回关于展览',
      backPath: '/exhibition',
    };
  }

  if (pathname === '/collection') {
    return {
      sectionLabel: '浏览展陈',
      sectionMeta: '浏览展览藏品档案',
      backLabel: '返回关于展览',
      backPath: '/exhibition',
    };
  }

  if (pathname === '/foreword') {
    return {
      sectionLabel: '展览结语',
      sectionMeta: '策展引言与观看说明',
      backLabel: '返回关于展览',
      backPath: '/exhibition',
    };
  }

  if (pathname === '/exhibition') {
    return {
      sectionLabel: '关于展览',
      sectionMeta: '泊岸生根的数字展览入口',
      backLabel: '返回网站首页',
      backPath: '/',
    };
  }

  return {
    sectionLabel: '关于展览',
    sectionMeta: '泊岸生根的数字展览入口',
    backLabel: '返回网站首页',
    backPath: '/',
  };
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: '关于展览', path: '/exhibition' },
    { name: '漫步展厅', path: '/hall' },
    { name: '浏览展陈', path: '/collection' },
    { name: '展览结语', path: '/foreword' },
    // { name: '策展团队', path: '/team' }, // 隐藏策展团队导航
  ];
  const exhibitionContext = getExhibitionContext(location.pathname);
  const isActiveNavItem = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary font-serif selection:bg-brand-accent/20">
      {/* 移动端 - 将两个导航放在一起 */}
      <div className="md:hidden sticky top-0 z-50">
        <SiteTopNav variant="exhibition" behavior="sticky" />
        {/* 移动端顶部横向导航 - 参照地图界面设计 */}
        <nav className="exhibition-mobile-nav w-full border-b border-brand-primary/[0.06] bg-white/80 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 px-4 py-3">
            {/* 返回按钮 */}
            <button
              onClick={() => navigate(exhibitionContext.backPath)}
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full border border-brand-primary/10 bg-white/80 text-brand-primary hover:bg-brand-accent/10 transition-colors"
              aria-label={exhibitionContext.backLabel}
            >
              <ArrowLeft size={18} />
            </button>
            
            {navItems.map((item) => {
              const isActive = isActiveNavItem(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive 
                      ? 'bg-brand-accent/12 text-brand-accent' 
                      : 'text-brand-muted hover:text-brand-accent'
                  }`}
                >
                  <span className="text-[13px] font-bold tracking-[0.18em] uppercase whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* 桌面端 - 只显示SiteTopNav */}
      <div className="hidden md:block">
        <SiteTopNav variant="exhibition" behavior="sticky" />
      </div>

      <div className="flex min-h-[calc(100vh-78px)] flex-col md:flex-row">
        {/* 桌面端侧边栏 */}
        <nav className="exhibition-sidebar-shell hidden md:flex w-56 sticky top-[78px] h-[calc(100vh-78px)] border-r border-brand-primary/[0.05] flex-col shrink-0 relative overflow-hidden shadow-[6px_0_20px_rgba(0,0,0,0.03)]">
          <div
            className="absolute inset-0 z-0 opacity-[0.05] grayscale pointer-events-none"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1541812169650-66336ba74b12?q=80&w=1200")',
              backgroundSize: 'cover',
              backgroundPosition: 'left center'
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col justify-center gap-8 w-full py-8 min-h-0">
            {navItems.map((item) => {
              const isActive = isActiveNavItem(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex w-full items-center justify-center px-8 transition-all duration-500 ${isActive ? 'text-brand-accent' : 'text-brand-muted hover:text-brand-accent'}`}
                >
                  <span className="text-[17px] font-bold tracking-[0.22em] uppercase text-center leading-relaxed">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="relative z-10 mt-auto w-full border-t border-brand-primary/[0.06] bg-white/30 px-6 py-10">
            <div className="mb-6 flex items-center justify-center">
              <div className="h-px w-8 bg-brand-accent/70"></div>
            </div>
            <div className="text-[10px] text-brand-muted/60 font-sans tracking-[0.25em] leading-relaxed uppercase font-bold">
              © 2026 TIANMU MUSEUM<br />
              ARCHIVE PROJECT
            </div>
          </div>
        </nav>

        <div className="flex-1 flex flex-col min-h-[calc(100vh-78px)] md:min-h-[calc(100vh-78px)]">

          <main className="flex-1 min-h-[calc(100vh-78px)] flex flex-col relative overflow-hidden paper-texture">
            <div key={location.pathname} className="flex-1 flex flex-col">
              <div className="px-5 md:px-12 lg:px-20 pb-12 md:pb-16 pt-8 md:pt-14 flex-1 flex flex-col">
              {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
