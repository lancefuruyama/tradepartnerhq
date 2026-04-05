import { useParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { toolDefinitions } from '../data/toolDefinitions';
import * as calculations from '../data/calculations';
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

  if (!tool) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
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

    const calculatorKey = `calculate${tool.name.replace(/\s+/g, '')}`;
    const calculatorFunction = (calculations as any)[calculatorKey];

    if (calculatorFunction) {
      try {
        const calculationResults = calculatorFunction(formData);
        setResults(calculationResults);
        setHasSubmitted(true);
      } catch (error) {
        console.error('Calculation error:', error);
        alert('Error processing calculation. Please check your inputs.');
      }
    } else {
      // Fallback results for demonstration
      setResults({
        primaryMetrics: [
          { label: 'Primary Metric 1', value: '125,000', subtext: '$' },
          { label: 'Primary Metric 2', value: '45%', subtext: '%' },
          { label: 'Primary Metric 3', value: '3.2x', subtext: 'ratio' },
          { label: 'Primary Metric 4', value: 'At Risk', subtext: 'status' },
        ],
        recommendations: [
          'Establish a credit facility to manage cash flow gaps',
          'Implement weekly cash reconciliation process',
          'Review collection procedures for past-due accounts',
        ],
        scoreBreakdown: [
          { label: 'Financial Health', value: 65 },
          { label: 'Operational Efficiency', value: 72 },
          { label: 'Risk Management', value: 58 },
          { label: 'Growth Potential', value: 80 },
        ],
        riskLevel: 'High',
        summary:
          'Your organization shows strong growth potential but needs immediate attention to cash flow management.',
      });
      setHasSubmitted(true);
    }
  };

  // ─── Export functions ──────────────────────────────────────────
  const exportAsPDF = () => {
    if (typeof window !== 'undefined' && (window as any).html2pdf) {
      const element = document.getElementById('results-section');
      if (element) {
        (window as any)
          .html2pdf()
          .set({ margin: 10, filename: `${tool.slug}.pdf` })
          .from(element)
          .save();
      }
    } else {
      const content = `${tool.name}\n\nResults:\n${JSON.stringify(results, null, 2)}`;
      downloadFile(content, `${tool.slug}.txt`, 'text/plain');
    }
  };

  const exportAsExcel = () => {
    const headers = ['Metric', 'Value'];
    const rows = (results.primaryMetrics || []).map((m: any) => [m.label, m.value]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    downloadFile(csv, `${tool.slug}.csv`, 'text/csv');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Email gate wraps export — returning users skip the modal entirely
  const handleExport = (format: 'pdf' | 'excel') => {
    if (!results) {
      alert('Please run the calculation first');
      return;
    }
    emailGate.requestExport(format, format === 'pdf' ? exportAsPDF : exportAsExcel);
  };

  // @ts-ignore — dynamic icon lookup
  const IconComponent = Icons[tool.iconName] || Icons.Zap;

  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
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

        {/* Form Section */}
        {!hasSubmitted && (
          <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Enter Your Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {tool.inputs.map((input) => (
                <div key={input.id}>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    {input.label}
                    {input.required && <span className="text-red-400">*</span>}
                  </label>

                  {input.type === 'select' ? (
                    <select
                      value={formData[input.id] || ''}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required={input.required}
                    >
                      <option value="">{input.placeholder || 'Select...'}</option>
                      {input.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      {input.prefix && <span className="text-zinc-400">{input.prefix}</span>}
                      <input
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
                      {input.suffix && <span className="text-zinc-400">{input.suffix}</span>}
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {results.primaryMetrics?.map((metric: any, idx: number) => (
                <div key={idx} className="bg-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-xs text-zinc-400 mb-2 uppercase font-semibold">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-amber-500">{metric.value}</p>
                  {metric.subtext && (
                    <p className="text-xs text-zinc-500 mt-1">{metric.subtext}</p>
                  )}
                </div>
              ))}
            </div>

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
                        <span className="text-sm text-amber-500 font-bold">{score.value}%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${score.value}%` }}
                        />
                      </div>
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

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleExport('pdf')}
                className="flex-1 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Export PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex-1 px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                  <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                  <path d="m10 13.5-2 2.5 2 2.5" />
                  <path d="m14 13.5 2 2.5-2 2.5" />
                </svg>
                Export Excel
              </button>
              <button
                onClick={() => {
                  setHasSubmitted(false);
                  setResults(null);
                }}
                className="flex-1 px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors font-medium"
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
