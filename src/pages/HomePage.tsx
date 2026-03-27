import { Link } from 'react-router-dom';
import { Calendar, Trophy, ArrowRight, Shield, Globe, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-zinc-950 min-h-screen">
      {/* Hero Section — gradient background for depth */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-zinc-950 to-zinc-950" />
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="mb-6 inline-block">
            <span className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full font-bold text-sm border border-amber-500/40 shadow-lg shadow-amber-500/10">
              FREE FOR SUBCONTRACTORS
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your Hub for{' '}
            <span className="text-amber-400">Trade Partner</span>{' '}
            Intelligence
          </h1>

          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Access outreach events and awarded contracts nationwide. Built for subcontractors who want to win more work.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold py-3.5 px-8 rounded-lg transition-all text-center shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
            >
              Explore Events
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/awards"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-8 rounded-lg transition-all text-center shadow-lg shadow-emerald-600/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
            >
              View Contract Awards
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-black text-amber-400">50</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mt-1">States Covered</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-emerald-400">140+</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mt-1">Contract Awards</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-blue-400">100%</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mt-1">Free to Use</p>
          </div>
        </div>
      </section>

      {/* Tools & Resources Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-2 text-center">Tools & Resources</h2>
          <p className="text-zinc-400 text-center mb-10">Everything you need to find your next project</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Outreach Events Card */}
            <Link
              to="/events"
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl p-8 hover:border-amber-500/60 hover:bg-zinc-900/80 transition-all group shadow-lg"
            >
              <div className="bg-amber-500 p-3 rounded-lg w-fit mb-4 shadow-md shadow-amber-500/20">
                <Calendar className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                Outreach Events
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Discover Meet the Primes, Build Expos, DBE/SBE outreach events, subcontractor networking, and trade conferences happening near you.
              </p>
              <span className="text-amber-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Browse events <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* Contract Awards Card */}
            <Link
              to="/awards"
              className="bg-zinc-900 border border-zinc-700/80 rounded-xl p-8 hover:border-emerald-500/60 hover:bg-zinc-900/80 transition-all group shadow-lg"
            >
              <div className="bg-emerald-500 p-3 rounded-lg w-fit mb-4 shadow-md shadow-emerald-500/20">
                <Trophy className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                Contract Awards
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Browse recently awarded construction projects across sectors. See who's winning work, project scope, and subcontractor opportunities.
              </p>
              <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                View awards <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Why TPHQ Section */}
      <section className="py-16 px-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-8 text-center">Why Trade Partner HQ?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center px-4">
              <div className="bg-amber-500/10 p-3 rounded-xl w-fit mx-auto mb-3 border border-amber-500/20">
                <Globe className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Nationwide Coverage</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Events and awards from every state — all in one place.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit mx-auto mb-3 border border-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Updated Weekly</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Fresh data scraped and curated so you never miss an opportunity.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="bg-blue-500/10 p-3 rounded-xl w-fit mx-auto mb-3 border border-blue-500/20">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Built for Subs</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                No login walls, no paywalls — just the intel you need to win work.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
