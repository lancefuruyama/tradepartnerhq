export function Footer() {
  const handleCalendly = () => {
    // @ts-expect-error Calendly is loaded via external script
    window.Calendly?.initPopupWidget({ url: 'https://calendly.com/lance-furuyama/tradepartnerhq' });
  };

  return (
    <footer id="about" className="bg-zinc-900 border-t-4 border-amber-500 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} TradePartnerHQ.com &mdash; 100% free. Built for the trades.
          </p>
          <button
            onClick={handleCalendly}
            className="text-xs text-amber-500 hover:text-amber-400 font-semibold transition-colors"
          >
            Free Tailgate Talk &mdash; Win More Profitable Work!
          </button>
        </div>
      </div>
    </footer>
  );
}
