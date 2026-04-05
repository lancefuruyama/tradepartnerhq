import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer id="about" className="bg-zinc-900 border-t-4 border-amber-500 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Trade Partner HQ</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Free business intelligence tools built for specialty contractors and subcontractors. Sign up once \u2014 full access forever.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Tools by Role</h3>
            <div className="space-y-2">
              <Link to="/toolkit?profile=owner-ceo" className="block text-zinc-400 text-sm hover:text-amber-400 transition-colors">Owner / CEO</Link>
              <Link to="/toolkit?profile=finance-cfo" className="block text-zinc-400 text-sm hover:text-amber-400 transition-colors">Finance / CFO</Link>
              <Link to="/toolkit?profile=operations-coo" className="block text-zinc-400 text-sm hover:text-amber-400 transition-colors">Operations / COO</Link>
              <Link to="/toolkit?profile=field-leadership" className="block text-zinc-400 text-sm hover:text-amber-400 transition-colors">Field Leadership</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm mb-3">Connect</h3>
            <div className="space-y-2">
              <Link to="/toolkit" className="block text-zinc-400 text-sm hover:text-amber-400 transition-colors">Open the Toolkit</Link>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  // @ts-expect-error Calendly is loaded via external script
                  window.Calendly?.initPopupWidget({ url: 'https://calendly.com/lance-furuyama/tradepartnerhq' });
                }}
                className="block text-zinc-400 text-sm hover:text-amber-400 transition-colors"
              >
                Free Tailgate Talk \u2014 Win More Profitable Work!
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} TradePartnerHQ.com &mdash; 100% free. Built for the trades.
          </p>
        </div>
      </div>
    </footer>
  );
}
