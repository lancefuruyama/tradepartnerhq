import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { toolDefinitions } from '../data/toolDefinitions';
import * as Icons from 'lucide-react';

const ROLES = [
  { id: 'owner-ceo', label: 'Owner/CEO', color: 'bg-blue-900' },
  { id: 'finance-cfo', label: 'Finance/CFO', color: 'bg-emerald-900' },
  { id: 'operations-coo', label: 'Operations/COO', color: 'bg-purple-900' },
  { id: 'field-leadership', label: 'Field Leadership', color: 'bg-orange-900' },
];

export default function ToolkitPage() {
  useEffect(() => {
    document.title = 'Free Toolkit | Trade Partner HQ';
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRole = searchParams.get('profile') || '';

  const filteredTools = useMemo(() => {
    if (!selectedRole) return toolDefinitions;
    return toolDefinitions.filter((tool) => tool.roles.includes(selectedRole));
  }, [selectedRole]);

  const handleRoleFilter = (roleId: string) => {
    if (selectedRole === roleId) {
      setSearchParams({});
    } else {
      setSearchParams({ profile: roleId });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-black py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Trade Partner Toolkit</h1>
          <p className="text-lg text-zinc-300 max-w-2xl">
            16 free, expert-designed tools to help construction leaders optimize operations, manage
            risk, and accelerate growth. Built for specialty contractors, by the industry.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-zinc-800 py-8 px-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-zinc-400 mb-4 font-medium">FILTER BY ROLE</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleFilter(role.id)}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedRole === role.id
                    ? `${role.color} text-white ring-2 ring-amber-500`
                    : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
          {selectedRole && (
            <button
              onClick={() => setSearchParams({})}
              className="mt-4 text-sm text-amber-500 hover:text-amber-400 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-400 text-lg">No tools available for this role.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => {
                // @ts-ignore - Dynamic icon lookup
                const IconComponent = Icons[tool.iconName] || Icons.Zap;

                return (
                  <Link
                    key={tool.slug}
                    to={`/toolkit/${tool.slug}`}
                    className="group bg-zinc-800 rounded-lg p-6 hover:bg-zinc-700 transition-all border border-zinc-700 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20"
                  >
                    {/* Icon */}
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <IconComponent className="w-6 h-6 text-amber-500" />
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-amber-500 uppercase">
                        {tool.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold mb-2 group-hover:text-amber-400 transition-colors">
                      {tool.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                      {tool.description}
                    </p>

                    {/* Roles */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tool.roles.map((roleId) => {
                        const role = ROLES.find((r) => r.id === roleId);
                        return role ? (
                          <span
                            key={roleId}
                            className="text-xs bg-zinc-700 text-zinc-300 px-2 py-1 rounded"
                          >
                            {role.label}
                          </span>
                        ) : null;
                      })}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-amber-500 font-medium group-hover:translate-x-1 transition-transform">
                      Open Tool
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
