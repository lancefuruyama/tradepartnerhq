import { Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-zinc-900 border-b-4 border-amber-500 sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg">
            <HardHat className="w-6 h-6 text-zinc-900" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">
              TRADE PARTNER <span className="text-amber-500">HQ</span>
            </h1>
            <p className="text-[11px] text-zinc-400 tracking-widest uppercase">
              Where Trade Partners and General Contractors Connect!
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <Link to="/events" className="hover:text-amber-500 transition-colors">Events</Link>
          <Link to="/awards" className="hover:text-amber-500 transition-colors">Contract Awards</Link>
        </nav>
      </div>
    </header>
  );
}
