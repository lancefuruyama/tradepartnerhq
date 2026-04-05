import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  DollarSign,
  HardHat,
  BarChart3,
  Calculator,
  Target,
  Users,
  Lock,
  CheckCircle,
  Briefcase,
  LineChart,
  Wrench,
  ClipboardCheck,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Tool metadata — what each tool does, grouped by role              */
/* ------------------------------------------------------------------ */
const tools = [
  { name: 'Cash Flow Gap Analyzer', slug: 'cash-flow-gap-analyzer', desc: 'Project 90-day cash shortfalls and get a mitigation playbook before they hit.', icon: DollarSign, category: 'Financial' },
  { name: 'Margin Erosion Monitor', slug: 'margin-erosion-monitor', desc: 'Spot the line items silently eating your margins — before they compound.', icon: LineChart, category: 'Financial' },
  { name: 'Overhead Benchmarker', slug: 'overhead-benchmarker', desc: 'Compare your overhead structure against industry norms and find reduction targets.', icon: BarChart3, category: 'Financial' },
  { name: 'Win Rate Tracker', slug: 'win-rate-tracker', desc: 'Analyze bid conversion rates by project type, GC, and market segment.', icon: Target, category: 'Biz Dev' },
  { name: 'Bid/No-Bid Decision Tool', slug: 'bid-no-bid-decision-tool', desc: 'Score opportunities on 24 financial and operational criteria before you commit resources.', icon: ClipboardCheck, category: 'Biz Dev' },
  { name: 'Prequalification Scorecard', slug: 'prequalification-scorecard', desc: 'Rank projects by strategic fit, risk, and profitability potential.', icon: CheckCircle, category: 'Biz Dev' },
  { name: 'Bonding Capacity Calculator', slug: 'bonding-capacity-calculator', desc: 'Know your bonding ceiling — and what financial levers move it.', icon: Calculator, category: 'Bonding & Insurance' },
  { name: 'Insurance Gap Analyzer', slug: 'insurance-gap-analyzer', desc: 'Identify coverage gaps that could cost you a project — or a lawsuit.', icon: Shield, category: 'Bonding & Insurance' },
  { name: 'EMR Simulator', slug: 'emr-simulator', desc: 'Model how safety incidents change your Experience Modification Rate and premiums.', icon: BarChart3, category: 'Safety' },
  { name: 'Safety Maturity Assessor', slug: 'safety-maturity-assessor', desc: 'Benchmark your safety program against best practices across 17 dimensions.', icon: Shield, category: 'Safety' },
  { name: 'Toolbox Talk Generator', slug: 'toolbox-talk-generator', desc: 'Generate trade-specific, job-site-ready safety talks in minutes.', icon: HardHat, category: 'Safety' },
  { name: 'Revenue Concentration Analyzer', slug: 'revenue-concentration-analyzer', desc: 'Quantify client, project, and geographic concentration risk.', icon: TrendingUp, category: 'Strategy' },
  { name: 'Growth Readiness Assessor', slug: 'growth-readiness-assessor', desc: 'Score your readiness to scale — people, systems, capital, and backlog.', icon: Briefcase, category: 'Strategy' },
  { name: 'Tech Stack Grader', slug: 'tech-stack-grader', desc: 'Grade your construction technology against industry benchmarks.', icon: Wrench, category: 'Software' },
  { name: 'Change Order Trend Tracker', slug: 'change-order-trend-tracker', desc: 'Track change order patterns to stop revenue leakage and improve scoping.', icon: LineChart, category: 'Operations' },
  { name: 'Crew Utilization Optimizer', slug: 'crew-utilization-optimizer', desc: 'Find hidden revenue in your crew schedule by optimizing utilization rates.', icon: Users, category: 'Operations' },
];

/* ------------------------------------------------------------------ */
/*  Role cards — how each persona benefits                            */
/* ------------------------------------------------------------------ */
const roles = [
  {
    title: 'Owner / CEO',
    icon: Briefcase,
    color: 'amber',
    description: 'Growth strategy, risk positioning, and market intelligence to scale with confidence.',
    toolHighlights: ['Growth Readiness Assessor', 'Revenue Concentration Analyzer', 'Win Rate Tracker', 'Bid/No-Bid Decision Tool'],
  },
  {
    title: 'Finance / CFO',
    icon: DollarSign,
    color: 'emerald',
    description: 'Cash flow forecasting, bonding capacity, insurance gaps, and margin tracking built for construction finance.',
    toolHighlights: ['Cash Flow Gap Analyzer', 'Margin Erosion Monitor', 'Bonding Capacity Calculator', 'Overhead Benchmarker'],
  },
  {
    title: 'Operations / COO',
    icon: Wrench,
    color: 'blue',
    description: 'Crew optimization, change order tracking, overhead benchmarking, and prequalification to run tighter ops.',
    toolHighlights: ['Crew Utilization Optimizer', 'Change Order Trend Tracker', 'Prequalification Scorecard', 'Tech Stack Grader'],
  },
  {
    title: 'Field Leadership',
    icon: HardHat,
    color: 'orange',
    description: 'Safety toolbox talks, crew management tools, and field-ready resources for superintendents and foremen.',
    toolHighlights: ['Toolbox Talk Generator', 'Safety Maturity Assessor', 'EMR Simulator', 'Crew Utilization Optimizer'],
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; glow: string }> = {
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20', glow: 'shadow-amber-500/10' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20', glow: 'shadow-emerald-500/10' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20', glow: 'shadow-blue-500/10' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20', glow: 'shadow-orange-500/10' },
};

export default function HomePage() {
  return (
    <div className="bg-zinc-950 min-h-screen">

      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-zinc-950 to-zinc-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-block">
            <span className="bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full font-bold text-sm border border-amber-500/40 shadow-lg shadow-amber-500/10">
              100% FREE — NO CREDIT CARD REQUIRED
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Business Intelligence Built for{' '}
            <span className="text-amber-400">Specialty Contractors</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            16 free tools that turn your real numbers into actionable decisions — cash flow projections, bid scoring, safety benchmarks, crew optimization, and more. Sign up once, get full access forever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/toolkit"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold py-4 px-10 rounded-lg transition-all text-center shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2 text-lg"
            >
              Explore the Toolkit
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="text-zinc-500 text-sm mt-4">
            Free account &rarr; Full access to every tool, every export, every insight.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STATS STRIP                                                  */}
      {/* ============================================================ */}
      <section className="border-y border-zinc-800 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl md:text-3xl font-black text-amber-400">16</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mt-1">Free Tools</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-emerald-400">4</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mt-1">Roles Supported</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-blue-400">$0</p>
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mt-1">Forever</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STORY #1 — THE CFO WHO STOPPED SWEATING PAYROLL              */}
      {/* ============================================================ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 inline-block">
            <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
              WHY IT MATTERS
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            The CFO Who Stopped Sweating Payroll Fridays
          </h2>
          <div className="space-y-5 text-zinc-300 leading-relaxed text-lg">
            <p>
              A $32M electrical contractor in Denver had a problem that looked like success. Three new hospital projects landed in the same quarter. Backlog was the strongest it had ever been. But the CFO — a 20-year industry veteran — noticed something the P&L didn't show: every one of those projects required six-figure equipment mobilization before the first draw.
            </p>
            <p>
              Combined with two existing projects hitting retainage holds simultaneously, the company was staring at a <span className="text-amber-400 font-semibold">$1.8M cash gap</span> that wouldn't appear on any income statement. The CFO had been managing cash in spreadsheets updated "when there was time" — which during a growth sprint meant almost never.
            </p>
            <p>
              After running the numbers through the <span className="text-amber-400 font-semibold">Cash Flow Gap Analyzer</span>, the picture changed in ten minutes. The tool mapped exactly which weeks would go negative, pinpointed the retainage-heavy billing cycles causing the crunch, and generated a mitigation playbook: accelerate billing on two projects by two weeks, restructure one equipment lease, and line up a credit extension before they needed it — not after.
            </p>
            <div className="bg-zinc-900 border-l-4 border-amber-500 p-6 rounded-r-lg">
              <p className="text-zinc-200 font-medium italic">
                "The information wasn't complicated. We just didn't have it in one place, looking 90 days ahead. That tool turned a potential crisis into a Tuesday morning conversation with our banker."
              </p>
            </div>
            <p>
              That's what these tools do. They take the numbers you already have and turn them into decisions you can make <em>before</em> the problem arrives.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ROLE-BASED SECTIONS                                          */}
      {/* ============================================================ */}
      <section className="py-20 px-4 bg-zinc-900/30 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Tools Mapped to <span className="text-amber-400">Your Role</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Whether you run the business, manage the money, optimize operations, or lead crews in the field — there's a toolkit section built for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((role) => {
              const c = colorMap[role.color];
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className={`bg-zinc-900 border ${c.border} rounded-xl p-8 shadow-lg ${c.glow} hover:border-opacity-60 transition-all`}
                >
                  <div className={`${c.bg} p-3 rounded-lg w-fit mb-4 border ${c.border}`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-5">{role.description}</p>
                  <div className="space-y-2">
                    {role.toolHighlights.map((t) => (
                      <div key={t} className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${c.text} flex-shrink-0`} />
                        <span className="text-zinc-300 text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/toolkit?profile=${role.title.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-')}`}
                    className={`mt-6 inline-flex items-center gap-1 ${c.text} text-sm font-semibold hover:gap-2 transition-all`}
                  >
                    View {role.title} tools <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STORY #2 — THE ESTIMATOR WHO LEARNED TO SAY NO               */}
      {/* ============================================================ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 inline-block">
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
              SMARTER BIDDING
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            The Estimating Team That Doubled Their Win Rate by Bidding Less
          </h2>
          <div className="space-y-5 text-zinc-300 leading-relaxed text-lg">
            <p>
              A $19M concrete subcontractor in Atlanta was bidding everything. Fifty-plus proposals a quarter, burning through estimating hours, chasing every RFP that crossed the desk. Their win rate? A brutal 8%. The estimators were exhausted, the owners were frustrated, and the bids they <em>were</em> winning tended to be the ones nobody else wanted — low-margin, high-risk jobs with GCs known for slow payment.
            </p>
            <p>
              The Chief Estimator started running every opportunity through the <span className="text-amber-400 font-semibold">Bid/No-Bid Decision Tool</span> before committing resources. The tool scores projects across 24 criteria: GC payment history, bonding requirements, schedule risk, geographic fit, crew availability, and margin probability. Within two months, the team went from 50 bids per quarter to 22 — a 56% reduction.
            </p>
            <p>
              The result? Their win rate jumped to <span className="text-amber-400 font-semibold">19%</span>. More importantly, the jobs they won had 4 points higher average margin and came from GCs with a track record of paying within 45 days. The <span className="text-amber-400 font-semibold">Win Rate Tracker</span> confirmed the trend month over month — fewer bids, better outcomes, less wasted estimating labor.
            </p>
            <div className="bg-zinc-900 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-zinc-200 font-medium italic">
                "We were confusing activity with strategy. The tool didn't tell us anything we didn't already suspect — but it gave us the discipline and the data to actually say no. That changed everything."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FULL TOOL DIRECTORY                                          */}
      {/* ============================================================ */}
      <section className="py-20 px-4 bg-zinc-900/30 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              16 Tools. <span className="text-amber-400">Zero Cost.</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Every tool runs on your real numbers, generates exportable reports, and delivers actionable intelligence — not generic advice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  to={`/toolkit/${tool.slug}`}
                  className="bg-zinc-900 border border-zinc-700/60 rounded-xl p-6 hover:border-amber-500/50 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex-shrink-0">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{tool.category}</span>
                      <h3 className="text-white font-bold text-sm group-hover:text-amber-400 transition-colors leading-tight">
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{tool.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STORY #3 — THE SUPERINTENDENT WHO CHANGED THE CULTURE        */}
      {/* ============================================================ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 inline-block">
            <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/30">
              FIELD LEADERSHIP
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8">
            The Superintendent Who Turned Safety Talks Into a Retention Tool
          </h2>
          <div className="space-y-5 text-zinc-300 leading-relaxed text-lg">
            <p>
              A $45M mechanical contractor in Houston had a familiar problem: toolbox talks were stale. The same photocopied sheets recycled every quarter. Crews tuned out. Attendance was technically 100% — because it was mandatory — but engagement was close to zero. When OSHA showed up for a spot inspection, three crew members couldn't recall the topic from that morning's talk.
            </p>
            <p>
              The general superintendent started using the <span className="text-amber-400 font-semibold">Toolbox Talk Generator</span> to produce talks tailored to the actual trade, the specific hazards on that week's job site, and the season. A concrete pour in August triggered heat illness protocols. Steel erection at height triggered fall protection refreshers with site-specific anchor points. The talks went from generic to relevant — and the crews noticed.
            </p>
            <p>
              Six months later, the <span className="text-amber-400 font-semibold">Safety Maturity Assessor</span> showed measurable improvement: near-miss reporting went up 40% (a leading indicator that crews are actually paying attention), recordable incidents dropped, and their <span className="text-amber-400 font-semibold">EMR Simulator</span> projected a 0.15-point improvement at next renewal — worth over $90,000 in annual premium savings.
            </p>
            <div className="bg-zinc-900 border-l-4 border-orange-500 p-6 rounded-r-lg">
              <p className="text-zinc-200 font-medium italic">
                "The foremen started asking for the talks instead of dreading them. That's when I knew something had changed. It went from a compliance checkbox to a tool they actually wanted."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS — SIGN UP CTA                                   */}
      {/* ============================================================ */}
      <section className="py-20 px-4 bg-zinc-900/30 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Get Started in <span className="text-amber-400">60 Seconds</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-2xl mx-auto">
            One free account. Full access to every tool. No trial period, no upsell, no strings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            <div className="text-center">
              <div className="bg-amber-500/10 p-4 rounded-xl w-fit mx-auto mb-4 border border-amber-500/20">
                <Lock className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-white font-bold mb-2">1. Sign Up Free</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Name and email. That's it. No credit card, no demo request form, no sales call required.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-500/10 p-4 rounded-xl w-fit mx-auto mb-4 border border-emerald-500/20">
                <BarChart3 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold mb-2">2. Run Your Numbers</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Pick any tool. Enter your real data. Get a custom analysis with exportable PDF and Excel reports.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/10 p-4 rounded-xl w-fit mx-auto mb-4 border border-blue-500/20">
                <TrendingUp className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2">3. Make Better Decisions</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Use the insights to bid smarter, manage cash, benchmark operations, and grow with confidence.
              </p>
            </div>
          </div>

          <Link
            to="/toolkit"
            className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold py-4 px-12 rounded-lg transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 text-lg inline-flex items-center gap-2"
          >
            Open the Free Toolkit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHY TPHQ — TRUST SIGNALS                                     */}
      {/* ============================================================ */}
      <section className="py-16 px-4 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-white mb-8 text-center">
            Why Trade Partner HQ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center px-4">
              <div className="bg-amber-500/10 p-3 rounded-xl w-fit mx-auto mb-3 border border-amber-500/20">
                <HardHat className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Built for the Trades</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Every tool is designed from the subcontractor's perspective — not generic business software repackaged with a hard hat.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit mx-auto mb-3 border border-emerald-500/20">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Actually Free</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                No freemium bait-and-switch. No "contact us for pricing." Sign up, run every tool, export every report. Period.
              </p>
            </div>
            <div className="text-center px-4">
              <div className="bg-blue-500/10 p-3 rounded-xl w-fit mx-auto mb-3 border border-blue-500/20">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-1">Decisions, Not Dashboards</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                These tools don't just display data. They tell you what to do — with specific, prioritized action items tied to your numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CTA — CALENDLY                                         */}
      {/* ============================================================ */}
      <section className="py-20 px-4 bg-zinc-900/50 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            Want to Talk Through Your Numbers?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Book a free 30-minute Tailgate Talk. We'll walk through your results, identify the biggest opportunities, and help you put a plan in motion — no pitch, no pressure.
          </p>
          {/* Calendly link widget */}
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              // @ts-expect-error Calendly is loaded via external script
              window.Calendly?.initPopupWidget({ url: 'https://calendly.com/lance-furuyama/tradepartnerhq' });
            }}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-10 rounded-lg transition-all border border-zinc-600 text-lg inline-flex items-center gap-2"
          >
            Grab a Time — It's Free
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
