import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface LeadRow {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  tool_slug: string;
  export_type: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

interface ToolStat {
  tool_slug: string;
  unique_leads: number;
  total_downloads: number;
  first_download: string;
  last_download: string;
}

export function AdminLeadStats() {
  const [stats, setStats] = useState<ToolStat[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedTool, dateRange]);

  async function loadData() {
    setLoading(true);
    try {
      // Load stats summary
      const { data: statsData } = await supabase
        .from('tool_lead_stats')
        .select('*');
      setStats(statsData || []);

      // Load individual leads
      let query = supabase
        .from('tool_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (selectedTool !== 'all') {
        query = query.eq('tool_slug', selectedTool);
      }

      if (dateRange !== 'all') {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte('created_at', since.toISOString());
      }

      const { data: leadsData } = await query;
      setLeads(leadsData || []);
    } catch (err) {
      console.error('Failed to load lead data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const { data } = await supabase
        .from('tool_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!data?.length) return;

      const headers = ['Email', 'Full Name', 'Company', 'Tool', 'Export Type', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Date'];
      const rows = data.map((r) => [
        r.email,
        r.full_name,
        r.company_name,
        r.tool_slug,
        r.export_type,
        r.utm_source || '',
        r.utm_medium || '',
        r.utm_campaign || '',
        new Date(r.created_at).toLocaleDateString(),
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.map((c: string) => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tphq-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const totalLeads = stats.reduce((sum, s) => sum + s.unique_leads, 0);
  const totalDownloads = stats.reduce((sum, s) => sum + s.total_downloads, 0);
  const toolSlugs = stats.map((s) => s.tool_slug);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Lead Capture</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Email gate submissions across all tools
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? 'Exporting...' : 'Export All Leads (CSV)'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Unique Leads</p>
          <p className="text-3xl font-black text-amber-500 mt-1">{totalLeads}</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Total Downloads</p>
          <p className="text-3xl font-black text-emerald-400 mt-1">{totalDownloads}</p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Avg Downloads/Lead</p>
          <p className="text-3xl font-black text-white mt-1">
            {totalLeads > 0 ? (totalDownloads / totalLeads).toFixed(1) : '\u2014'}
          </p>
        </div>
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
          <p className="text-xs text-zinc-400 uppercase tracking-wider">Tools With Leads</p>
          <p className="text-3xl font-black text-white mt-1">
            {stats.filter((s) => s.unique_leads > 0).length}
          </p>
        </div>
      </div>

      {/* Per-Tool Breakdown */}
      {stats.length > 0 && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-700">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
              Leads by Tool
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/50">
                  <th className="text-left px-4 py-2 text-zinc-400 font-medium">Tool</th>
                  <th className="text-right px-4 py-2 text-zinc-400 font-medium">Unique Leads</th>
                  <th className="text-right px-4 py-2 text-zinc-400 font-medium">Downloads</th>
                  <th className="text-right px-4 py-2 text-zinc-400 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.tool_slug} className="border-t border-zinc-700/50 hover:bg-zinc-700/30">
                    <td className="px-4 py-2.5 text-white font-medium">
                      {formatToolSlug(s.tool_slug)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-amber-400 font-bold">
                      {s.unique_leads}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-300">
                      {s.total_downloads}
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-400 text-xs">
                      {new Date(s.last_download).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
          className="bg-zinc-800 border border-zinc-600 text-white rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Tools</option>
          {toolSlugs.map((slug) => (
            <option key={slug} value={slug}>
              {formatToolSlug(slug)}
            </option>
          ))}
        </select>

        <div className="flex bg-zinc-800 border border-zinc-600 rounded-lg overflow-hidden">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-amber-500 text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Table */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
            Recent Leads ({leads.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : leads.length === 0 ? (
          <p className="text-center py-12 text-zinc-500">No leads captured yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800/50">
                  <th className="text-left px-4 py-2 text-zinc-400 font-medium">Name</th>
                  <th className="text-left px-4 py-2 text-zinc-400 font-medium">Email</th>
                  <th className="text-left px-4 py-2 text-zinc-400 font-medium">Company</th>
                  <th className="text-left px-4 py-2 text-zinc-400 font-medium">Tool</th>
                  <th className="text-left px-4 py-2 text-zinc-400 font-medium">Type</th>
                  <th className="text-left px-4 py-2 text-zinc-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-zinc-700/50 hover:bg-zinc-700/30">
                    <td className="px-4 py-2.5 text-white font-medium whitespace-nowrap">
                      {lead.full_name}
                    </td>
                    <td className="px-4 py-2.5 text-amber-400 whitespace-nowrap">
                      <a href={`mailto:${lead.email}`} className="hover:underline">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 whitespace-nowrap">
                      {lead.company_name}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-300 whitespace-nowrap">
                      {formatToolSlug(lead.tool_slug)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        lead.export_type === 'pdf'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {lead.export_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-400 text-xs whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/** Convert 'cash-flow-gap-analyzer' → 'Cash Flow Gap Analyzer' */
function formatToolSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
