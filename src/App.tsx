import React from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { appBase } from './lib/base';
import MapApp from './modules/map/App';

// 导入模块化后的页面组件
import Home from './pages/Home';
import Preface from './pages/Preface';
import Exhibitions from './pages/Exhibitions';
import ExhibitionDetail from './pages/ExhibitionDetail';
import ArticleDetail from './pages/ArticleDetail';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import About from './pages/About';
import SiteHome from './pages/SiteHome';
import Team from './pages/Team';

function ExhibitionShell() {
  return (
    <div className="exhibition-module-theme min-h-screen">
      <Layout>
        <Outlet />
      </Layout>
    </div>
  );
}

function MapPage() {
  return (
    <div className="map-module-theme min-h-screen">
      <MapApp />
    </div>
  );
}

/**
 * 应用程序主入口
 * 小白用户也可以通过这个文件快速掌握整个网站的页面结构
 */
function App() {
  return (
    <Router basename={appBase}>
      <ScrollToTop />
      <Routes>
        {/* 网站首页 */}
        <Route path="/" element={<SiteHome />} />

        {/* 地图模块 */}
        <Route path="/map" element={<MapPage />} />

        {/* 展览模块 */}
        <Route element={<ExhibitionShell />}>
          <Route path="/exhibition" element={<Home />} />

          {/* 关于天穆 */}
          <Route path="/about" element={<About />} />

          {/* 展览结语 */}
          <Route path="/foreword" element={<Preface />} />

          {/* 展厅列表 - 漫步展厅 */}
          <Route path="/hall" element={<Exhibitions />} />

          {/* 展厅详情 - 单元列表 */}
          <Route path="/hall/:exId" element={<ExhibitionDetail />} />

          {/* 单元详情 - 展品组详情 */}
          <Route path="/hall/:exId/:unitId" element={<ArticleDetail />} />

          {/* 藏品库列表 - 浏览展陈 */}
          <Route path="/collection" element={<Collections />} />

          {/* 藏品详情 */}
          <Route path="/collection/:id" element={<CollectionDetail />} />

          {/* 策展团队 */}
          <Route path="/team" element={<Team />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
