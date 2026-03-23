export function Footer() {
  return (
    <footer id="about" className="bg-zinc-900 border-t-4 border-amber-500 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="border-t border-zinc-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} TradePartnerHQ.com &mdash; 100% free. Built for the trades.
          </p>
        </div>
      </div>
    </footer>
  );
}
