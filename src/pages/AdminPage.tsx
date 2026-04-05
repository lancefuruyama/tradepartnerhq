import { AdminLeadStats } from '../components/AdminLeadStats';
import { clearSavedLeadInfo } from '../lib/leadCapture';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">
              TPHQ <span className="text-amber-500">Admin</span>
            </h1>
            <p className="text-zinc-400 mt-1">Lead capture dashboard &amp; tool analytics</p>
          </div>
          <button
            onClick={() => {
              clearSavedLeadInfo();
              alert('Local lead info cleared — email gate will show on next export.');
            }}
            className="px-4 py-2 bg-zinc-800 border border-zinc-600 text-zinc-300 hover:text-white rounded-lg text-sm transition-colors"
          >
            Reset Email Gate (Debug)
          </button>
        </div>

        {/* Lead Stats Panel */}
        <AdminLeadStats />
      </div>
    </div>
  );
}
