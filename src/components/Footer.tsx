import { HardHat } from 'lucide-react';

export function Footer() {
  return (
    <footer id="about" className="bg-zinc-900 border-t-4 border-amber-500 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-amber-500 p-1.5 rounded">
                <HardHat className="w-4 h-4 text-zinc-900" />
              </div>
              <span className="font-black text-white">
                TRADE PARTNER <span className="text-amber-500">HQ</span>
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The free aggregator connecting trades and SBE/DBE firms with GC outreach
              events, bid opportunities, and industry networking across the United States.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Sources We Monitor
            </h4>
            <ul className="text-sm text-zinc-500 space-y-1.5">
              <li>State DOT SBE/DBE Programs</li>
              <li>SAM.gov Federal Procurement</li>
              <li>LinkedIn GC Outreach Posts</li>
              <li>AGC, ABC & NAHB Chapters</li>
              <li>City & County Procurement Offices</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Event Types
            </h4>
            <ul className="text-sm text-zinc-500 space-y-1.5">
              <li>Networking / Meet & Greet Events</li>
              <li>Bid Opportunities with SBE/DBE Goals</li>
              <li>Certification Workshops & Trainings</li>
              <li>Industry Conferences & Trade Shows</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} TradePartnerHQ.com &mdash; 100% free. Built for the trades.
          </p>
          <p className="text-xs text-zinc-600">
            Events scraped daily. Data provided as-is. Always verify with the source.
          </p>
        </div>
      </div>
    </footer>
  );
}
