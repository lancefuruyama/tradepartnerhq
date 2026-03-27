import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AwardsPage from './pages/AwardsPage';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/awards" element={<AwardsPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
