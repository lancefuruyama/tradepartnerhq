import { useState, useEffect } from 'react';
import { AdminLeadStats } from '../components/AdminLeadStats';
import { clearSavedLeadInfo } from '../lib/leadCapture';

const ADMIN_KEY = 'tphq_admin_auth';

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Admin | Trade Partner HQ';
    // Check if already authenticated in this session
    if (sessionStorage.getItem(ADMIN_KEY) === 'true') {
      setIsAuthed(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password gate — not a security boundary, just keeps casual visitors out
    if (password === 'tphq2026') {
      setIsAuthed(true);
      sessionStorage.setItem(ADMIN_KEY, 'true');
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full">
          <h1 className="text-2xl font-bold text-center mb-6">
            TPHQ <span className="text-amber-500">Admin</span>
          </h1>
          <form onSubmit={handleLogin} className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <label htmlFor="admin-pw" className="block text-sm font-medium text-zinc-300 mb-2">
              Admin Password
            </label>
            <input
              id="admin-pw"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">
              TPHQ <span className="text-amber-500">Admin</span>
            </h1>
            <p className="text-zinc-400 mt-1">Lead capture dashboard &amp; tool analytics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                clearSavedLeadInfo();
                alert('Local lead info cleared — email gate will show on next export.');
              }}
              className="px-4 py-2 bg-zinc-800 border border-zinc-600 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
            >
              Reset Email Gate (Debug)
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem(ADMIN_KEY);
                setIsAuthed(false);
              }}
              className="px-4 py-2 bg-zinc-800 border border-zinc-600 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Lead Stats Panel */}
        <AdminLeadStats />
      </div>
    </div>
  );
}
