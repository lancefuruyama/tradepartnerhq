import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HardHat, Menu, X } from 'lucide-react';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCalendly = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    // @ts-expect-error Calendly is loaded via external script
    window.Calendly?.initPopupWidget({ url: 'https://calendly.com/lance-furuyama/tradepartnerhq' });
  };

  return (
    <header className="bg-zinc-900 border-b-4 border-amber-500 sticky top-0 z-[1000]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg">
            <HardHat className="w-6 h-6 text-zinc-900" />
          </div>
          <div>
            <div className="text-xl font-black text-white tracking-tight leading-none">
              TRADE PARTNER <span className="text-amber-500">HQ</span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-widest uppercase">
              Free Business Intelligence for Specialty Contractors
            </p>
          </div>
        </Link>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-zinc-300 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <Link to="/toolkit" className="hover:text-amber-500 transition-colors">Toolkit</Link>
          <button
            onClick={handleCalendly}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold py-2 px-4 rounded-lg transition-all text-sm"
          >
            Free Consultation
          </button>
        </nav>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 py-4 space-y-3">
          <Link
            to="/toolkit"
            onClick={() => setMenuOpen(false)}
            className="block text-zinc-300 hover:text-amber-500 transition-colors py-2 text-sm font-medium"
          >
            Toolkit
          </Link>
          <button
            onClick={handleCalendly}
            className="block w-full bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold py-3 px-4 rounded-lg transition-all text-sm text-center"
          >
            Free Consultation
          </button>
        </nav>
      )}
    </header>
  );
}
