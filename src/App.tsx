import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const HomePage = lazy(() => import('./pages/HomePage'));
const ToolkitPage = lazy(() => import('./pages/ToolkitPage'));
const ToolPage = lazy(() => import('./pages/ToolPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      <Header />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/toolkit" element={<ToolkitPage />} />
            <Route path="/toolkit/:slug" element={<ToolPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
