import { AnimatePresence, MotionConfig } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Footer, Header, UpdateBanner } from './components/Layout';
import { PageSkeleton } from './components/ui';
import HomePage from './pages/HomePage';

const CandidatePage = lazy(() => import('./pages/CandidatePage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ThemesPage = lazy(() => import('./pages/ThemesPage'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const MethodologyPage = lazy(() => import('./pages/MethodologyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <MotionConfig reducedMotion="user">
      <a href="#contenu" className="bg-ink text-canvas sr-only z-50 rounded-lg px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Aller au contenu
      </a>
      <UpdateBanner />
      <Header />
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/candidats/:id" element={<CandidatePage />} />
            <Route path="/comparateur" element={<ComparePage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/programmes" element={<ProgramsPage />} />
            <Route path="/methodologie" element={<MethodologyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <Footer />
    </MotionConfig>
  );
}
