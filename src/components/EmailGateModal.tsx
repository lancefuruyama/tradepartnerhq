import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { LeadInfo } from '../lib/leadCapture';

interface EmailGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: LeadInfo) => Promise<void>;
  isSubmitting: boolean;
  exportType: 'pdf' | 'excel' | null;
  toolName?: string;
}

export function EmailGateModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  exportType,
  toolName,
}: EmailGateModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email field when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => emailRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatLabel = exportType === 'excel' ? 'Excel' : 'PDF';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Basic validation
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();
    const trimmedCompany = companyName.trim();

    if (!trimmedEmail || !trimmedName || !trimmedCompany) {
      setError('All fields are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    await onSubmit({
      email: trimmedEmail,
      fullName: trimmedName,
      companyName: trimmedCompany,
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
      >
        <div
          className="relative bg-zinc-900 border-2 border-amber-500 rounded-xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 px-6 pt-6 pb-4 border-b border-zinc-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-amber-500 p-2 rounded-lg">
                {exportType === 'excel' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="m10 13.5-2 2.5 2 2.5" />
                    <path d="m14 13.5 2 2.5-2 2.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-900">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                )}
              </div>
              <div>
                <h2 id="gate-title" className="text-lg font-bold text-white">
                  Download Your {formatLabel} Report
                </h2>
                {toolName && (
                  <p className="text-sm text-zinc-400">{toolName}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-300 mt-2">
              Enter your details below and your report will download immediately. 100% free, no credit card required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="gate-name" className="block text-sm font-medium text-zinc-300 mb-1">
                Full Name
              </label>
              <input
                id="gate-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Mike Rodriguez"
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                autoComplete="name"
                disabled={isSubmitting}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="gate-email" className="block text-sm font-medium text-zinc-300 mb-1">
                Work Email
              </label>
              <input
                ref={emailRef}
                id="gate-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. mike@abcelectric.com"
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="gate-company" className="block text-sm font-medium text-zinc-300 mb-1">
                Company Name
              </label>
              <input
                id="gate-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. ABC Electric Inc."
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                autoComplete="organization"
                disabled={isSubmitting}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-zinc-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Preparing Download...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download {formatLabel} Report
                </>
              )}
            </button>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                No spam, ever
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                100% free
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Instant download
              </span>
            </div>
          </form>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
