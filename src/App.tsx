import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useAuth } from './hooks/useAuth';
import { useCallback } from 'react';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AwardsPage from './pages/AwardsPage';

export default function App() {
  const auth = useAuth();

  const handleLogin = useCallback(async (email: string) => {
    await auth.signIn(email, 'password');
  }, [auth]);

  const handleLogout = useCallback(async () => {
    await auth.signOut();
  }, [auth]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header
        isLoggedIn={auth.isLoggedIn}
        userEmail={auth.userEmail}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

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
