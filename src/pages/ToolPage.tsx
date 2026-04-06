import { useParams } from 'react-router-dom';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Printer, AlertCircle, Info, Building2, Lightbulb, ClipboardCopy, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toolDefinitions } from '../data/toolDefinitions';
import { calculateTool } from '../data/calculations';
import { EmailGateModal } from '../components/EmailGateModal';
import { useEmailGate } from '../hooks/useEmailGate';

const RISK_COLORS: Record<string, string> = {
  Low: 'text-green-400',
  Medium: 'text-yellow-400',
  High: 'text-orange-400',
  Critical: 'text-red-400',
};

const RISK_BG: Record<string, string> = {
  Low: 'bg-green-900/20 border-green-800',
  Medium: 'bg-yellow-900/20 border-yellow-800',
  High: 'bg-orange-900/20 border-orange-800',
  Critical: 'bg-red-900/20 border-red-800',
};

export default function ToolPage() {
  const { slug } = useParams<{ slug: string }>();
  const tool = useMemo(() => toolDefinitions.find((t) => t.slug === slug), [slug]);

  // Pre-built one-time email gate — returning users bypass the modal
  const emailGate = useEmailGate({ toolSlug: slug || '' });

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const calendlyFiredRef = useRef(false);

  // Set unique page title per tool
  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} | Trade Partner HQ`;
    }
    return () => { document.title = 'Trade Partner HQ — Free Business Intelligence for Specialty Contractors'; };
  }, [tool]);

  // Reset Calendly flag when results change (new calculation)
  useEffect(() => {
    calendlyFiredRef.current = false;
  }, [results]);

  // Calendly popup when user scrolls to bottom of results
  useEffect(() => {
    if (!results || !resultsEndRef.current) return;
    const el = resultsEndRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !calendlyFiredRef.current) {
          calendlyFiredRef.current = true;
          // Small delay so user sees the bottom content first
          setTimeout(() => {
            if ((window as any).Calendly) {
              (window as any).Calendly.initPopupWidget({
                url: 'https://calendly.com/lance-furuyama/tradepartnerhq',
              });
            }
          }, 800);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [results]);

  // ─── Print Results ──────────────────────────────────────────
  const printResults = () => {
    if (!results || !tool) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print your results.');
      return;
    }
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sectionHead = (t: string) => `<h2 style="margin:18px 0 8px;font-size:16px;color:#b45309;border-bottom:2px solid #d97706;padding-bottom:4px;">${esc(t)}</h2>`;
    const bulletList = (items: string[]) => `<ul style="margin:4px 0 12px 20px;">${items.map(i => `<li style="margin:3px 0;font-size:13px;">${esc(i)}</li>`).join('')}</ul>`;

    const sections: string[] = [];
    sections.push(`<h1 style="margin:0 0 4px;font-size:22px;">${esc(tool.name)}</h1>`);
    sections.push(`<p style="color:#666;margin:0 0 16px;font-size:14px;">Company: <strong>${esc(formData.companyName || 'N/A')}</strong></p>`);

    if (results.summary) { sections.push(sectionHead('Summary')); sections.push(`<p>${esc(results.summary)}</p>`); }

    if (results.metrics?.length) {
      sections.push(sectionHead('Key Metrics'));
      sections.push(`<table style="border-collapse:collapse;width:100%;margin-bottom:12px;">${results.metrics.map((m: any) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666;font-size:13px;">${esc(m.label)}</td><td style="padding:4px 0;font-weight:bold;font-size:13px;">${esc(m.value)}</td></tr>`
      ).join('')}</table>`);
    }

    if (results.riskLevel) {
      const colors: Record<string, string> = { Low: '#16a34a', Medium: '#ca8a04', High: '#ea580c', Critical: '#dc2626' };
      sections.push(sectionHead('Risk Level'));
      sections.push(`<p style="font-weight:bold;color:${colors[results.riskLevel] || '#666'};font-size:15px;">${esc(results.riskLevel)}</p>`);
      if (results.riskMessage) sections.push(`<p style="font-size:13px;">${esc(results.riskMessage)}</p>`);
    }

    if (results.insight) { sections.push(sectionHead('Key Insight')); sections.push(`<p style="font-style:italic;">${esc(results.insight)}</p>`); }

    if (results.detailedAnalysis?.sections) {
      sections.push(sectionHead(results.detailedAnalysis.title || 'Detailed Analysis'));
      results.detailedAnalysis.sections.forEach((s: any) => {
        sections.push(`<h3 style="margin:10px 0 4px;font-size:14px;color:#b45309;">${esc(s.title)}</h3>`);
        if (s.items?.length) sections.push(bulletList(s.items));
      });
    }

    if (results.recommendations?.length) {
      sections.push(sectionHead('Recommendations'));
      sections.push(`<ol style="margin:4px 0 12px 20px;">${results.recommendations.map((r: string) => `<li style="margin:4px 0;font-size:13px;">${esc(r)}</li>`).join('')}</ol>`);
    }

    if (results.scenarioAnalysis) {
      sections.push(sectionHead(results.scenarioAnalysis.title || 'Scenario Analysis'));
      if (results.scenarioAnalysis.ifActionTaken) {
        sections.push(`<h3 style="margin:8px 0 4px;font-size:14px;color:#16a34a;">✓ ${esc(results.scenarioAnalysis.ifActionTaken.title)}</h3>`);
        if (results.scenarioAnalysis.ifActionTaken.items?.length) sections.push(bulletList(results.scenarioAnalysis.ifActionTaken.items));
      }
      if (results.scenarioAnalysis.ifNoAction) {
        sections.push(`<h3 style="margin:8px 0 4px;font-size:14px;color:#dc2626;">✗ ${esc(results.scenarioAnalysis.ifNoAction.title)}</h3>`);
        if (results.scenarioAnalysis.ifNoAction.items?.length) sections.push(bulletList(results.scenarioAnalysis.ifNoAction.items));
      }
    }

    if (results.industryBenchmarks?.items?.length) { sections.push(sectionHead(results.industryBenchmarks.title || 'Industry Benchmarks')); sections.push(bulletList(results.industryBenchmarks.items)); }
    if (results.projections?.items?.length) { sections.push(sectionHead(results.projections.title || 'Financial Projections')); sections.push(bulletList(results.projections.items)); }
    if (results.cascadingImpact?.items?.length) { sections.push(sectionHead(results.cascadingImpact.title || 'Cascading Business Impact')); sections.push(bulletList(results.cascadingImpact.items)); }

    sections.push(`<hr style="border:none;border-top:2px solid #e5e5e5;margin:20px 0 10px;"/>`);
    sections.push(`<p style="color:#999;font-size:11px;">Generated by <a href="https://tradepartnerhq.com" style="color:#d97706;">Trade Partner HQ</a></p>`);

    printWindow.document.write(`<!DOCTYPE html><html><head><title>${esc(tool.name)} — ${esc(formData.companyName || 'Report')}</title><style>@media print{@page{margin:0.75in;}body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#222;">${sections.join('\n')}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  if (!tool) {
    return (
      <div className="bg-zinc-900 flex items-center justify-center p-4 py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Tool not found</h1>
          <p className="text-zinc-400">The tool you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (inputId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [inputId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missingRequired = tool.inputs.filter(
      (input) => input.required && !formData[input.id]
    );
    if (missingRequired.length > 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const calculationResults = calculateTool(slug!, formData);
      if ((calculationResults as any).error) {
        alert('Error: ' + (calculationResults as any).error);
        return;
      }
      setResults(calculationResults);
      setHasSubmitted(true);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error processing calculation. Please check your inputs.');
    }
  };

  // ─── Copy to Clipboard (Rich HTML + plain-text fallback) ────
  const copyToClipboard = async () => {
    if (!results || !tool) return;

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sectionHead = (title: string) =>
      `<h2 style="margin:16px 0 8px;font-size:16px;color:#f59e0b;border-bottom:2px solid #f59e0b;padding-bottom:4px;">${esc(title)}</h2>`;
    const bulletList = (items: string[]) =>
      `<ul style="margin:4px 0 12px 20px;padding:0;">${items.map(i => `<li style="margin:2px 0;color:#333;">${esc(i)}</li>`).join('')}</ul>`;

    const html: string[] = [];
    const plain: string[] = [];
    const divider = '─'.repeat(50);

    // ── Header ──
    html.push(`<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:700px;">`);
    html.push(`<h1 style="margin:0 0 4px;font-size:20px;color:#18181b;">${esc(tool.name)}</h1>`);
    html.push(`<p style="margin:0 0 12px;color:#71717a;font-size:14px;">Company: <strong>${esc(formData.companyName || 'N/A')}</strong></p>`);
    plain.push(tool.name.toUpperCase(), `Company: ${formData.companyName || 'N/A'}`, divider);

    // ── Summary ──
    if (results.summary) {
      html.push(sectionHead('Summary'));
      html.push(`<p style="color:#333;">${esc(results.summary)}</p>`);
      plain.push('', 'SUMMARY', results.summary);
    }

    // ── Key Metrics ──
    if (results.metrics?.length) {
      html.push(sectionHead('Key Metrics'));
      html.push(`<table style="border-collapse:collapse;width:100%;margin-bottom:12px;">`);
      results.metrics.forEach((m: any) => {
        html.push(`<tr><td style="padding:4px 12px 4px 0;color:#71717a;font-size:14px;">${esc(m.label)}</td><td style="padding:4px 0;font-weight:bold;font-size:14px;color:#18181b;">${esc(m.value)}</td></tr>`);
      });
      html.push('</table>');
      plain.push('', 'KEY METRICS', divider);
      results.metrics.forEach((m: any) => { plain.push(`  ${m.label}: ${m.value}`); });
    }

    // ── Risk Alert ──
    if (results.riskLevel) {
      const riskColor: Record<string, string> = { Low: '#22c55e', Medium: '#eab308', High: '#f97316', Critical: '#ef4444' };
      const color = riskColor[results.riskLevel] || '#71717a';
      html.push(sectionHead('Risk Level'));
      html.push(`<p style="font-weight:bold;color:${color};font-size:15px;">${esc(results.riskLevel)}</p>`);
      if (results.riskMessage) html.push(`<p style="color:#333;font-size:14px;">${esc(results.riskMessage)}</p>`);
      plain.push('', `RISK LEVEL: ${results.riskLevel}`);
      if (results.riskMessage) plain.push(`  ${results.riskMessage}`);
    }

    // ── Insight ──
    if (results.insight) {
      html.push(sectionHead('Key Insight'));
      html.push(`<p style="color:#333;font-style:italic;">${esc(results.insight)}</p>`);
      plain.push('', 'KEY INSIGHT', `  ${results.insight}`);
    }

    // ── Detailed Analysis ──
    if (results.detailedAnalysis?.sections) {
      html.push(sectionHead(results.detailedAnalysis.title || 'Detailed Analysis'));
      results.detailedAnalysis.sections.forEach((section: any) => {
        html.push(`<h3 style="margin:10px 0 4px;font-size:14px;color:#f59e0b;">${esc(section.title)}</h3>`);
        if (section.items?.length) html.push(bulletList(section.items));
      });
      plain.push('', (results.detailedAnalysis.title || 'DETAILED ANALYSIS').toUpperCase(), divider);
      results.detailedAnalysis.sections.forEach((section: any) => {
        plain.push('', `  ${section.title}`);
        section.items?.forEach((item: string) => { plain.push(`    • ${item}`); });
      });
    }

    // ── Recommendations ──
    if (results.recommendations?.length) {
      html.push(sectionHead('Recommendations'));
      html.push(`<ol style="margin:4px 0 12px 20px;padding:0;">${results.recommendations.map((r: string) => `<li style="margin:4px 0;color:#333;">${esc(r)}</li>`).join('')}</ol>`);
      plain.push('', 'RECOMMENDATIONS', divider);
      results.recommendations.forEach((rec: string, idx: number) => { plain.push(`  ${idx + 1}. ${rec}`); });
    }

    // ── Scenario Analysis ──
    if (results.scenarioAnalysis) {
      html.push(sectionHead(results.scenarioAnalysis.title || 'Scenario Analysis'));
      if (results.scenarioAnalysis.ifActionTaken) {
        html.push(`<h3 style="margin:8px 0 4px;font-size:14px;color:#22c55e;">✓ ${esc(results.scenarioAnalysis.ifActionTaken.title)}</h3>`);
        if (results.scenarioAnalysis.ifActionTaken.items?.length) html.push(bulletList(results.scenarioAnalysis.ifActionTaken.items));
      }
      if (results.scenarioAnalysis.ifNoAction) {
        html.push(`<h3 style="margin:8px 0 4px;font-size:14px;color:#ef4444;">✗ ${esc(results.scenarioAnalysis.ifNoAction.title)}</h3>`);
        if (results.scenarioAnalysis.ifNoAction.items?.length) html.push(bulletList(results.scenarioAnalysis.ifNoAction.items));
      }
      plain.push('', (results.scenarioAnalysis.title || 'SCENARIO ANALYSIS').toUpperCase(), divider);
      if (results.scenarioAnalysis.ifActionTaken) {
        plain.push(`  ${results.scenarioAnalysis.ifActionTaken.title}`);
        results.scenarioAnalysis.ifActionTaken.items?.forEach((i: string) => { plain.push(`    ✓ ${i}`); });
      }
      if (results.scenarioAnalysis.ifNoAction) {
        plain.push(`  ${results.scenarioAnalysis.ifNoAction.title}`);
        results.scenarioAnalysis.ifNoAction.items?.forEach((i: string) => { plain.push(`    ✗ ${i}`); });
      }
    }

    // ── Industry Benchmarks ──
    if (results.industryBenchmarks?.items?.length) {
      html.push(sectionHead(results.industryBenchmarks.title || 'Industry Benchmarks'));
      html.push(bulletList(results.industryBenchmarks.items));
      plain.push('', (results.industryBenchmarks.title || 'INDUSTRY BENCHMARKS').toUpperCase(), divider);
      results.industryBenchmarks.items.forEach((i: string) => { plain.push(`  • ${i}`); });
    }

    // ── Projections ──
    if (results.projections?.items?.length) {
      html.push(sectionHead(results.projections.title || 'Financial Projections'));
      html.push(bulletList(results.projections.items));
      plain.push('', (results.projections.title || 'FINANCIAL PROJECTIONS').toUpperCase(), divider);
      results.projections.items.forEach((i: string) => { plain.push(`  • ${i}`); });
    }

    // ── Cascading Impact ──
    if (results.cascadingImpact?.items?.length) {
      html.push(sectionHead(results.cascadingImpact.title || 'Cascading Business Impact'));
      html.push(bulletList(results.cascadingImpact.items));
      plain.push('', (results.cascadingImpact.title || 'CASCADING BUSINESS IMPACT').toUpperCase(), divider);
      results.cascadingImpact.items.forEach((i: string) => { plain.push(`  • ${i}`); });
    }

    // ── Footer ──
    html.push(`<hr style="border:none;border-top:2px solid #e4e4e7;margin:16px 0 8px;"/>`);
    html.push(`<p style="color:#a1a1aa;font-size:12px;">Generated by <a href="https://tradepartnerhq.com" style="color:#f59e0b;">Trade Partner HQ</a></p>`);
    html.push('</div>');
    plain.push('', divider, 'Generated by Trade Partner HQ — tradepartnerhq.com');

    const htmlString = html.join('\n');
    const plainString = plain.join('\n');

    try {
      // Modern Clipboard API — writes both HTML and plain text
      const htmlBlob = new Blob([htmlString], { type: 'text/html' });
      const textBlob = new Blob([plainString], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: use execCommand with a contenteditable div for rich text
      try {
        const container = document.createElement('div');
        container.innerHTML = htmlString;
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.setAttribute('contenteditable', 'true');
        document.body.appendChild(container);
        const range = document.createRange();
        range.selectNodeContents(container);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand('copy');
        sel?.removeAllRanges();
        document.body.removeChild(container);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Last resort: plain text
        const textarea = document.createElement('textarea');
        textarea.value = plainString;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  // @ts-ignore — dynamic icon lookup
  const IconComponent = Icons[tool.iconName] || Icons.Zap;

  return (
    <div className="bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <span className="text-sm font-semibold text-amber-500 uppercase">
                {tool.category}
              </span>
              <h1 className="text-4xl font-bold">{tool.name}</h1>
            </div>
          </div>
          <p className="text-lg text-zinc-300">{tool.description}</p>
        </div>

        {/* What Does This Tool Do? */}
        <div className="bg-zinc-800 rounded-lg p-6 mb-6 border border-zinc-700">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-amber-500 mb-2">What does this tool do?</h2>
              <p className="text-zinc-300 leading-relaxed">{tool.whatItDoes}</p>
            </div>
          </div>
        </div>

        {/* Case Study */}
        <div className="bg-zinc-800/50 rounded-lg p-6 mb-8 border border-zinc-700/50">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-bold text-amber-500 uppercase mb-3">Case Study: {tool.caseStudy.company}</h2>
              <p className="text-zinc-400 text-sm mb-2"><span className="text-zinc-300 font-semibold">The Challenge:</span> {tool.caseStudy.situation}</p>
              <p className="text-zinc-400 text-sm"><span className="text-zinc-300 font-semibold">The Result:</span> {tool.caseStudy.result}</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        {!hasSubmitted && (
          <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Enter Your Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Company Name (always first) */}
              <div className="md:col-span-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-zinc-200 mb-2">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {tool.inputs.map((input) => (
                <div key={input.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <label htmlFor={`input-${input.id}`} className="block text-sm font-medium text-zinc-200">
                      {input.label}
                      {input.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {input.tooltip && (
                      <div className="relative">
                        <button
                          type="button"
                          aria-label={`More info about ${input.label}`}
                          onClick={() => setTooltipOpen(tooltipOpen === input.id ? null : input.id)}
                          onMouseEnter={() => setTooltipOpen(input.id)}
                          onMouseLeave={() => setTooltipOpen(null)}
                          className="text-zinc-500 hover:text-amber-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -m-2.5"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        {tooltipOpen === input.id && (
                          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-zinc-600 rounded-lg shadow-xl text-xs text-zinc-300 leading-relaxed">
                            {input.tooltip}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                              <div className="w-2 h-2 bg-zinc-900 border-r border-b border-zinc-600 transform rotate-45" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {input.type === 'select' ? (
                    <select
                      id={`input-${input.id}`}
                      value={formData[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
                      required={input.required}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        paddingRight: '36px',
                      }}
                    >
                      <option value="">Select...</option>
                      {input.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {input.prefix && <span className="text-zinc-400 text-sm font-medium">{input.prefix}</span>}
                      <input
                        id={`input-${input.id}`}
                        type={input.type === 'number' ? 'number' : 'text'}
                        value={formData[input.id] || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                        min={input.min}
                        max={input.max}
                        step={input.step}
                        className="flex-1 px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required={input.required}
                      />
                      {input.suffix && <span className="text-zinc-400 text-sm">{input.suffix}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Calculate Results
            </button>
          </form>
        )}

        {/* Results Section */}
        {hasSubmitted && results && (
          <div id="results-section" className="space-y-8">
            {/* Primary Metrics Grid */}
            {results.primaryMetrics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {results.primaryMetrics.map((metric: any, idx: number) => (
                  <div key={idx} className="bg-zinc-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-zinc-400 mb-2 uppercase font-semibold">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-amber-500">{metric.value}</p>
                    {metric.subtext && (
                      <p className="text-xs text-zinc-500 mt-1">{metric.subtext}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Risk Level Alert */}
            {results.riskLevel && (
              <div
                className={`rounded-lg p-4 border ${RISK_BG[results.riskLevel] || RISK_BG.Medium}`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${RISK_COLORS[results.riskLevel] || RISK_COLORS.Medium}`}
                  />
                  <div>
                    <p
                      className={`font-bold ${RISK_COLORS[results.riskLevel] || RISK_COLORS.Medium}`}
                    >
                      Risk Level: {results.riskLevel}
                    </p>
                    <p className="text-sm text-zinc-300 mt-1">{results.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Score Breakdown */}
            {results.scoreBreakdown && results.scoreBreakdown.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Score Breakdown</h3>
                <div className="space-y-4">
                  {results.scoreBreakdown.map((score: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{score.label}</span>
                        <span className="text-sm text-amber-500 font-bold">{Math.round(score.value)}%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${Math.min(score.value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Analysis Sections */}
            {results.detailedAnalysis?.sections && results.detailedAnalysis.sections.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Detailed Analysis</h3>
                <div className="space-y-5">
                  {results.detailedAnalysis.sections.map((section: any, idx: number) => (
                    <div key={idx}>
                      <h4 className="text-sm font-bold text-amber-500 uppercase mb-2">{section.title}</h4>
                      <ul className="space-y-1">
                        {section.items.map((item: string, itemIdx: number) => (
                          <li key={itemIdx} className="text-sm text-zinc-300 pl-3 border-l-2 border-zinc-700 py-0.5">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Recommendations</h3>
                <ol className="space-y-3">
                  {results.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-amber-500 font-bold flex-shrink-0">{idx + 1}.</span>
                      <span className="text-zinc-300">{rec}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Scenario Analysis */}
            {results.scenarioAnalysis && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">{results.scenarioAnalysis.title || 'Scenario Analysis'}</h3>
                {results.scenarioAnalysis.ifActionTaken && (
                  <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-bold text-green-400 uppercase mb-3">{results.scenarioAnalysis.ifActionTaken.title}</h4>
                    <ul className="space-y-1">
                      {results.scenarioAnalysis.ifActionTaken.items?.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-zinc-300 pl-3 border-l-2 border-green-700 py-0.5">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.scenarioAnalysis.ifNoAction && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-red-400 uppercase mb-3">{results.scenarioAnalysis.ifNoAction.title}</h4>
                    <ul className="space-y-1">
                      {results.scenarioAnalysis.ifNoAction.items?.map((item: string, idx: number) => (
                        <li key={idx} className="text-sm text-zinc-300 pl-3 border-l-2 border-red-700 py-0.5">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Industry Benchmarks */}
            {results.industryBenchmarks?.items && results.industryBenchmarks.items.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{results.industryBenchmarks.title || 'Industry Benchmarks'}</h3>
                <ul className="space-y-2">
                  {results.industryBenchmarks.items.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-300 pl-3 border-l-2 border-amber-700 py-0.5">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Projections */}
            {results.projections?.items && results.projections.items.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{results.projections.title || 'Financial Projections'}</h3>
                <ul className="space-y-2">
                  {results.projections.items.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-300 pl-3 border-l-2 border-blue-700 py-0.5">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cascading Impact */}
            {results.cascadingImpact?.items && results.cascadingImpact.items.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">{results.cascadingImpact.title || 'Cascading Business Impact'}</h3>
                <ul className="space-y-2">
                  {results.cascadingImpact.items.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-zinc-300 pl-3 border-l-2 border-purple-700 py-0.5">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={printResults}
                className="flex-1 min-w-[140px] px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex-1 min-w-[140px] px-5 py-3 border rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-green-900/30 border-green-700 text-green-400'
                    : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {copied ? <Check className="w-5 h-5" /> : <ClipboardCopy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => {
                  setHasSubmitted(false);
                  setResults(null);
                }}
                className="flex-1 min-w-[140px] px-5 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                Recalculate
              </button>
            </div>

            {/* Sentinel for Calendly popup trigger */}
            <div ref={resultsEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Email Gate Modal — one-time only, returning users skip it */}
      <EmailGateModal
        isOpen={emailGate.isGateOpen}
        onClose={emailGate.closeGate}
        onSubmit={emailGate.handleGateSubmit}
        isSubmitting={emailGate.isSubmitting}
        exportType={emailGate.pendingExportType}
        toolName={tool.name}
      />
    </div>
  );
}
