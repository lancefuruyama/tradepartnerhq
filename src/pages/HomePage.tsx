import { Link } from 'react-router-dom';
import { Calendar, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-zinc-900 min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-6 inline-block">
            <span className="bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full font-bold text-sm border border-amber-500/30">
              FREE FOR SUBCONTRACTORS
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your Hub for{' '}
            <span className="text-amber-500">Trade Partner</span>{' '}
            Intelligence
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Access outreach events and awarded contracts nationwide. Built for subcontractors who want to win more work.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="bg-amber-500 hover:bg-amber-600 text-zinc-900 font-bold py-3 px-8 rounded-lg transition-colors text-center"
            >
              Explore Events
            </Link>
            <Link
              to="/awards"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-center border border-zinc-700"
            >
              View Contract Awards
            </Link>
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
              className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 hover:border-amber-500/50 hover:bg-zinc-800/80 transition-all group"
            >
              <div className="bg-amber-500 p-3 rounded-lg w-fit mb-4">
                <Calendar className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                Outreach Events
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Discover Meet the Primes, Build Expos, DBE/SBE outreach events, subcontractor networking, and trade conferences happening near you.
              </p>
            </Link>

            {/* Awarded Contracts Card */}
            <Link
              to="/awards"
              className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 hover:border-amber-500/50 hover:bg-zinc-800/80 transition-all group"
            >
              <div className="bg-emerald-500 p-3 rounded-lg w-fit mb-4">
                <Trophy className="w-6 h-6 text-zinc-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                Contract Awards
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Browse recently awarded construction projects across sectors. See who's winning work, project scope, and subcontractor opportunities.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
