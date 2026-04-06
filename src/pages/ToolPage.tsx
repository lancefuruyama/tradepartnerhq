import { useParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { FileText, AlertCircle, Info, Building2, Lightbulb, ClipboardCopy, Check } from 'lucide-react';
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

  // Set unique page title per tool
  useEffect(() => {
    if (tool) {
      document.title = `${tool.name} | Trade Partner HQ`;
    }
    return () => { document.title = 'Trade Partner HQ — Free Business Intelligence for Specialty Contractors'; };
  }, [tool]);

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

  // ─── Copy to Clipboard ──────────────────────────────────────
  const copyToClipboard = async () => {
    if (!results || !tool) return;

    const lines: string[] = [];
    const divider = '─'.repeat(50);

    // Header
    lines.push(tool.name.toUpperCase());
    lines.push(`Company: ${formData.companyName || 'N/A'}`);
    lines.push(divider);

    // Summary / headline
    if (results.summary) {
      lines.push('');
      lines.push('SUMMARY');
      lines.push(results.summary);
    }

    // Key Metrics
    if (results.metrics && results.metrics.length > 0) {
      lines.push('');
      lines.push('KEY METRICS');
      lines.push(divider);
      results.metrics.forEach((m: any) => {
        lines.push(`  ${m.label}: ${m.value}`);
      });
    }

    // Risk Alert
    if (results.riskLevel) {
      lines.push('');
      lines.push(`RISK LEVEL: ${results.riskLevel}`);
      if (results.riskMessage) lines.push(`  ${results.riskMessage}`);
    }

    // Insight
    if (results.insight) {
      lines.push('');
      lines.push('KEY INSIGHT');
      lines.push(`  ${results.insight}`);
    }

    // Detailed Analysis
    if (results.detailedAnalysis?.sections) {
      lines.push('');
      lines.push(results.detailedAnalysis.title?.toUpperCase() || 'DETAILED ANALYSIS');
      lines.push(divider);
      results.detailedAnalysis.sections.forEach((section: any) => {
        lines.push('');
        lines.push(`  ${section.title}`);
        section.items?.forEach((item: string) => {
          lines.push(`    • ${item}`);
        });
      });
    }

    // Recommendations
    if (results.recommendations && results.recommendations.length > 0) {
      lines.push('');
      lines.push('RECOMMENDATIONS');
      lines.push(divider);
      results.recommendations.forEach((rec: string, idx: number) => {
        lines.push(`  ${idx + 1}. ${rec}`);
      });
    }

    // Scenario Analysis
    if (results.scenarioAnalysis) {
      lines.push('');
      lines.push(results.scenarioAnalysis.title?.toUpperCase() || 'SCENARIO ANALYSIS');
      lines.push(divider);
      if (results.scenarioAnalysis.ifActionTaken) {
        lines.push(`  ${results.scenarioAnalysis.ifActionTaken.title}`);
        results.scenarioAnalysis.ifActionTaken.items?.forEach((item: string) => {
          lines.push(`    ✓ ${item}`);
        });
      }
      if (results.scenarioAnalysis.ifNoAction) {
        lines.push(`  ${results.scenarioAnalysis.ifNoAction.title}`);
        results.scenarioAnalysis.ifNoAction.items?.forEach((item: string) => {
          lines.push(`    ✗ ${item}`);
        });
      }
    }

    // Industry Benchmarks
    if (results.industryBenchmarks?.items && results.industryBenchmarks.items.length > 0) {
      lines.push('');
      lines.push(results.industryBenchmarks.title?.toUpperCase() || 'INDUSTRY BENCHMARKS');
      lines.push(divider);
      results.industryBenchmarks.items.forEach((item: string) => {
        lines.push(`  • ${item}`);
      });
    }

    // Projections
    if (results.projections?.items && results.projections.items.length > 0) {
      lines.push('');
      lines.push(results.projections.title?.toUpperCase() || 'FINANCIAL PROJECTIONS');
      lines.push(divider);
      results.projections.items.forEach((item: string) => {
        lines.push(`  • ${item}`);
      });
    }

    // Cascading Impact
    if (results.cascadingImpact?.items && results.cascadingImpact.items.length > 0) {
      lines.push('');
      lines.push(results.cascadingImpact.title?.toUpperCase() || 'CASCADING BUSINESS IMPACT');
      lines.push(divider);
      results.cascadingImpact.items.forEach((item: string) => {
        lines.push(`  • ${item}`);
      });
    }

    // Footer
    lines.push('');
    lines.push(divider);
    lines.push('Generated by Trade Partner HQ — tradepartnerhq.com');

    const text = lines.join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers / insecure contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ─── Professional PDF Export ──────────────────────────────────
  const exportAsPDF = async () => {
    if (!results || !tool) return;

    // Ensure html2pdf.js is loaded (dynamic fallback for slow mobile connections)
    if (!(window as any).html2pdf) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PDF library'));
        document.head.appendChild(script);
      }).catch(() => {
        alert('Could not load PDF library. Please check your connection and try again.');
        return;
      });
    }

    const companyName = formData.companyName || 'Your Company';
    const now = new Date();
    void now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Page footer HTML (used on every page)
    const pageFooter = `
      <div style="display:flex;justify-content:space-between;padding:12px 32px;border-top:1px solid #ddd;font-size:10px;color:#999;page-break-inside:avoid;">
        <span>TradePartnerHQ.com | Page <span class="page-number">1</span></span>
        <span>calendly.com/lance-furuyama/tradepartnerhq</span>
      </div>
    `;

    // Build detailed analysis sections HTML
    let detailedAnalysisHTML = '';
    if (results.detailedAnalysis?.sections) {
      detailedAnalysisHTML = `
        <div style="page-break-inside:avoid;">
          <div style="background:#d97706;padding:10px 16px;margin-bottom:16px;">
            <h2 style="color:#fff;font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
              ${results.detailedAnalysis.title || 'DETAILED ANALYSIS'}
            </h2>
          </div>
          ${results.detailedAnalysis.subtitle ? `<p style="color:#666;font-size:11px;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.5px;">${results.detailedAnalysis.subtitle}</p>` : ''}
          ${results.detailedAnalysis.sections
            .map(
              (section: any) => `
            <div style="margin-bottom:16px;page-break-inside:avoid;">
              <h3 style="color:#d97706;font-size:13px;font-weight:700;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.5px;">${section.title}</h3>
              ${section.items.map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:3px 0 3px 16px;">* ${item}</div>`).join('')}
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    // Build action plan HTML
    let actionPlanHTML = '';
    if (results.actionPlan?.phases) {
      actionPlanHTML = `
        <div style="page-break-inside:avoid;">
          <div style="background:#d97706;padding:10px 16px;margin-bottom:16px;">
            <h2 style="color:#fff;font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
              ${results.actionPlan.title || 'ACTION PLAN'}
            </h2>
          </div>
          ${results.actionPlan.subtitle ? `<p style="color:#666;font-size:11px;margin:0 0 16px 0;text-transform:uppercase;letter-spacing:0.5px;">${results.actionPlan.subtitle}</p>` : ''}
          ${results.actionPlan.phases
            .map(
              (phase: any) => `
            <div style="margin-bottom:16px;page-break-inside:avoid;">
              <h3 style="color:#d97706;font-size:13px;font-weight:700;margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.5px;">${phase.title}</h3>
              ${phase.description ? `<p style="color:#666;font-size:11px;margin:0 0 8px 0;line-height:1.5;">${phase.description}</p>` : ''}
              ${phase.items.map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:3px 0 3px 16px;">* ${item}</div>`).join('')}
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }

    // Build measurement section HTML
    let measurementHTML = '';
    if (results.measurement?.items) {
      measurementHTML = `
        <div style="page-break-inside:avoid;">
          <h3 style="color:#d97706;font-size:13px;font-weight:700;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.5px;">
            ${results.measurement.title || 'MEASUREMENT'}
          </h3>
          ${results.measurement.items.map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:3px 0 3px 16px;margin-bottom:6px;">* ${item}</div>`).join('')}
        </div>
      `;
    }

    // Build expected outcomes section HTML
    let expectedOutcomesHTML = '';
    if (results.expectedOutcomes?.items) {
      expectedOutcomesHTML = `
        <div style="margin-top:16px;page-break-inside:avoid;">
          <h3 style="color:#d97706;font-size:13px;font-weight:700;margin:0 0 12px 0;text-transform:uppercase;letter-spacing:0.5px;">
            ${results.expectedOutcomes.title || 'EXPECTED OUTCOMES'}
          </h3>
          ${results.expectedOutcomes.items.map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:3px 0 3px 16px;margin-bottom:6px;">* ${item}</div>`).join('')}
        </div>
      `;
    }

    // Build scenario analysis HTML
    let scenarioHTML = '';
    if (results.scenarioAnalysis) {
      const sa = results.scenarioAnalysis;
      scenarioHTML = `
        <div style="page-break-inside:avoid;">
          <div style="background:#d97706;padding:10px 16px;margin-bottom:16px;">
            <h2 style="color:#fff;font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
              ${sa.title || 'SCENARIO ANALYSIS'}
            </h2>
          </div>
          ${sa.ifActionTaken ? `
            <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 16px;margin-bottom:12px;page-break-inside:avoid;">
              <h3 style="color:#16a34a;font-size:12px;font-weight:700;margin:0 0 8px 0;text-transform:uppercase;">${sa.ifActionTaken.title || 'IF ACTION TAKEN'}</h3>
              ${(sa.ifActionTaken.items || []).map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:2px 0 2px 12px;">+ ${item}</div>`).join('')}
            </div>
          ` : ''}
          ${sa.ifNoAction ? `
            <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;margin-bottom:8px;page-break-inside:avoid;">
              <h3 style="color:#dc2626;font-size:12px;font-weight:700;margin:0 0 8px 0;text-transform:uppercase;">${sa.ifNoAction.title || 'IF NO ACTION TAKEN'}</h3>
              ${(sa.ifNoAction.items || []).map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:2px 0 2px 12px;">- ${item}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    // Build industry benchmarks HTML
    let benchmarksHTML = '';
    if (results.industryBenchmarks?.items) {
      benchmarksHTML = `
        <div style="page-break-inside:avoid;">
          <div style="background:#d97706;padding:10px 16px;margin-bottom:16px;">
            <h2 style="color:#fff;font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
              ${results.industryBenchmarks.title || 'INDUSTRY BENCHMARKS'}
            </h2>
          </div>
          ${results.industryBenchmarks.items.map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:3px 0 3px 16px;margin-bottom:4px;">* ${item}</div>`).join('')}
        </div>
      `;
    }

    // Build projections HTML
    let projectionsHTML = '';
    if (results.projections?.items) {
      projectionsHTML = `
        <div style="page-break-inside:avoid;">
          <div style="background:#d97706;padding:10px 16px;margin-bottom:16px;">
            <h2 style="color:#fff;font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
              ${results.projections.title || 'FINANCIAL PROJECTIONS'}
            </h2>
          </div>
          ${results.projections.items.map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:3px 0 3px 16px;margin-bottom:4px;">* ${item}</div>`).join('')}
        </div>
      `;
    }

    // Build cascading impact HTML
    let cascadingHTML = '';
    if (results.cascadingImpact?.items) {
      cascadingHTML = `
        <div style="page-break-inside:avoid;">
          <div style="background:#d97706;padding:10px 16px;margin-bottom:16px;">
            <h2 style="color:#fff;font-size:13px;font-weight:700;margin:0;text-transform:uppercase;letter-spacing:0.5px;">
              ${results.cascadingImpact.title || 'CASCADING BUSINESS IMPACT'}
            </h2>
          </div>
          ${results.cascadingImpact.items.map((item: string) => `<div style="color:#333;font-size:11px;line-height:1.6;padding:3px 0 3px 16px;margin-bottom:4px;">* ${item}</div>`).join('')}
        </div>
      `;
    }

    // Build CTA box HTML
    const ctaHTML = `
      <div style="page-break-inside:avoid;background:#333;padding:20px 24px;margin-top:24px;text-align:center;border-radius:4px;">
        <p style="color:#d97706;font-size:16px;font-weight:700;margin:0 0 10px 0;">Ready to take action?</p>
        <p style="color:#fff;font-size:12px;margin:0;">Book a free 30-min session:<br /><span style="color:#d97706;font-weight:700;">calendly.com/lance-furuyama/tradepartnerhq</span></p>
      </div>
    `;

    // Build primary metrics HTML
    const metricsHTML = (results.primaryMetrics || [])
      .map(
        (m: any) => `
        <div style="background:#f8f8f8;border-left:3px solid #d97706;padding:12px 16px;margin-bottom:8px;page-break-inside:avoid;">
          <div style="font-size:10px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;font-weight:700;">${m.label}</div>
          <div style="font-size:15px;font-weight:700;color:#1a1a1a;">${m.value}</div>
          ${m.subtext ? `<div style="font-size:10px;color:#666;margin-top:2px;">${m.subtext}</div>` : ''}
        </div>
      `
      )
      .join('');

    const pdfHTML = `
      <div id="pdf-export" style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a;width:100%;margin:0;padding:0;background:#fff;">
        <!-- Header -->
        <div style="background:#1a1a1a;padding:28px 32px 20px;">
          <h1 style="color:#fff;font-size:26px;font-weight:700;margin:0 0 6px 0;">${tool.name}</h1>
          <p style="color:#999;font-size:13px;margin:0;">${companyName} - Trade Partner HQ Analysis</p>
        </div>
        <div style="background:#1a1a1a;height:2px;"></div>

        <!-- Key Metrics -->
        <div style="padding:24px 32px 12px;">
          <h2 style="color:#d97706;font-size:15px;font-weight:700;margin:0 0 16px 0;text-transform:uppercase;letter-spacing:0.5px;">KEY METRICS</h2>
          ${metricsHTML}
        </div>

        <!-- Detailed Analysis -->
        <div style="padding:0 32px 20px;">
          ${detailedAnalysisHTML}
        </div>

        <!-- Action Plan (flows naturally, no forced page break) -->
        <div style="padding:0 32px 20px;">
          ${actionPlanHTML}
        </div>

        <!-- Measurement + Expected Outcomes -->
        ${measurementHTML || expectedOutcomesHTML ? `
          <div style="padding:0 32px 20px;">
            ${measurementHTML}
            ${expectedOutcomesHTML}
          </div>
        ` : ''}

        <!-- Scenario Analysis -->
        ${scenarioHTML ? `<div style="padding:0 32px 20px;">${scenarioHTML}</div>` : ''}

        <!-- Industry Benchmarks -->
        ${benchmarksHTML ? `<div style="padding:0 32px 20px;">${benchmarksHTML}</div>` : ''}

        <!-- Projections -->
        ${projectionsHTML ? `<div style="padding:0 32px 20px;">${projectionsHTML}</div>` : ''}

        <!-- Cascading Impact -->
        ${cascadingHTML ? `<div style="padding:0 32px 20px;">${cascadingHTML}</div>` : ''}

        <!-- CTA + Footer -->
        <div style="padding:0 32px 12px;">
          ${ctaHTML}
        </div>
        ${pageFooter}
      </div>
    `;

    // Create a temporary container for html2pdf
    // Fixed width ensures consistent PDF rendering on all viewports (desktop & mobile)
    const container = document.createElement('div');
    container.innerHTML = pdfHTML;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    document.body.appendChild(container);

    const pdfElement = container.querySelector('#pdf-export');
    const pdfFilename = `${tool.slug}-${companyName.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    // Detect mobile/tablet (iOS Safari, Android Chrome, etc.)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document);

    if (pdfElement && (window as any).html2pdf) {
      const worker = (window as any)
        .html2pdf()
        .set({
          margin: [10, 0, 10, 0],
          filename: pdfFilename,
          image: { type: 'jpeg', quality: isMobile ? 0.92 : 0.98 },
          html2canvas: {
            scale: isMobile ? 1.5 : 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] },
        })
        .from(pdfElement);

      if (isMobile) {
        // Mobile: generate blob and open in new tab (works on iOS Safari + Android Chrome)
        worker.outputPdf('blob').then((blob: Blob) => {
          document.body.removeChild(container);
          const blobUrl = URL.createObjectURL(blob);

          // Try <a download> first (works on Android Chrome)
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = pdfFilename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Fallback for iOS Safari: also open in new tab after short delay
          // iOS Safari ignores <a download>, so opening the blob URL shows the PDF
          // where the user can tap share → save/print
          setTimeout(() => {
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                (navigator.userAgent.includes('Mac') && 'ontouchend' in document)) {
              window.open(blobUrl, '_blank');
            } else {
              URL.revokeObjectURL(blobUrl);
            }
          }, 500);
        }).catch(() => {
          document.body.removeChild(container);
          alert('PDF generation failed. Please try again.');
        });
      } else {
        // Desktop: standard save (creates <a download> internally)
        worker.save().then(() => {
          document.body.removeChild(container);
        }).catch(() => {
          document.body.removeChild(container);
          alert('PDF generation failed. Please try again.');
        });
      }
    } else {
      document.body.removeChild(container);
      // Fallback: plain text download
      const content = `${tool.name}\n\n${JSON.stringify(results, null, 2)}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tool.slug}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Email gate wraps export — returning users skip the modal entirely
  const handleExport = () => {
    if (!results) {
      alert('Please run the calculation first');
      return;
    }
    emailGate.requestExport('pdf', exportAsPDF);
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
                onClick={() => handleExport()}
                className="flex-1 min-w-[140px] px-5 py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Export PDF
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
                {copied ? 'Copied!' : 'Copy Results'}
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
