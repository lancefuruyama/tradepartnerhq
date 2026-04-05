import { useState, useCallback, useRef } from 'react';
import {
  getSavedLeadInfo,
  submitLead,
  type LeadInfo,
  type LeadSubmission,
} from '../lib/leadCapture';

interface UseEmailGateOptions {
  toolSlug: string;
}

interface UseEmailGateReturn {
  /** Whether the modal is currently open */
  isGateOpen: boolean;
  /** Call this instead of directly triggering export. It either opens the gate
   *  or (for returning users) fires the export immediately. */
  requestExport: (exportType: 'pdf' | 'excel', exportFn: () => void) => void;
  /** Close the gate modal without exporting */
  closeGate: () => void;
  /** Called by the modal when user submits — saves lead, runs export, triggers Calendly */
  handleGateSubmit: (info: LeadInfo) => Promise<void>;
  /** The export type that was requested ('pdf' | 'excel') */
  pendingExportType: 'pdf' | 'excel' | null;
  /** Whether the submission is in progress */
  isSubmitting: boolean;
}

export function useEmailGate({ toolSlug }: UseEmailGateOptions): UseEmailGateReturn {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<'pdf' | 'excel' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingExportFn = useRef<(() => void) | null>(null);

  const requestExport = useCallback(
    (exportType: 'pdf' | 'excel', exportFn: () => void) => {
      const savedInfo = getSavedLeadInfo();

      if (savedInfo) {
        // Returning user — skip gate, submit lead silently, run export
        submitLead({ ...savedInfo, toolSlug, exportType }).catch(() => {});
        exportFn();
        // Fire Calendly popup after a short delay (let the download start first)
        setTimeout(() => triggerCalendlyPopup(), 1500);
        return;
      }

      // First-time user — show the gate
      pendingExportFn.current = exportFn;
      setPendingExportType(exportType);
      setIsGateOpen(true);
    },
    [toolSlug]
  );

  const closeGate = useCallback(() => {
    setIsGateOpen(false);
    setPendingExportType(null);
    pendingExportFn.current = null;
  }, []);

  const handleGateSubmit = useCallback(
    async (info: LeadInfo) => {
      setIsSubmitting(true);
      try {
        const submission: LeadSubmission = {
          ...info,
          toolSlug,
          exportType: pendingExportType || 'pdf',
        };

        // Submit to Supabase (non-blocking — download proceeds even if this fails)
        await submitLead(submission);

        // Trigger the actual export (download starts immediately)
        if (pendingExportFn.current) {
          pendingExportFn.current();
        }

        // Close the modal
        setIsGateOpen(false);
        setPendingExportType(null);
        pendingExportFn.current = null;

        // Fire Calendly popup after a short delay
        setTimeout(() => triggerCalendlyPopup(), 1500);
      } finally {
        setIsSubmitting(false);
      }
    },
    [toolSlug, pendingExportType]
  );

  return {
    isGateOpen,
    requestExport,
    closeGate,
    handleGateSubmit,
    pendingExportType,
    isSubmitting,
  };
}

// ─── Calendly popup ──────────────────────────────────────────
function triggerCalendlyPopup(): void {
  try {
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: 'https://calendly.com/lance-furuyama/tradepartnerhq',
      });
    }
  } catch {
    // Calendly not loaded — not critical
  }
}
