import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="bg-zinc-900 relative overflow-hidden">
      {/* Diagonal stripe pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 20px, #F59E0B 20px, #F59E0B 22px)',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-12 bg-amber-500 rounded-full" />
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">
              Free for all trades
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            Find GC Outreach Events
            <br />
            <span className="text-amber-500">Near You.</span>
          </h2>
          <p className="text-zinc-400 text-base md:text-lg mb-6 leading-relaxed max-w-xl">
            Your one-stop shop for finding GC outreach events, Meet the Primes,
            and networking opportunities — so you can win more work. Free and updated weekly.
          </p>
          <div className="flex gap-3">
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold"
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Search className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Map
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
