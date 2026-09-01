import { useRef, useState } from 'react';
import { exportConversation, importConversation } from '../lib/exportImport';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId: string;
  onImportSuccess: (newConvId: string) => void;
}

export function ExportImportModal({
  isOpen,
  onClose,
  activeConversationId,
  onImportSuccess,
}: ExportImportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  async function handleExport() {
    setIsExporting(true);
    setError(null);
    try {
      await exportConversation(activeConversationId);
    } catch {
      setError('Failed to export conversation');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);
    try {
      const newConvId = await importConversation(file);
      onImportSuccess(newConvId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        <h2 className="mb-2 text-base font-bold text-neutral-100">Export / Import Conversation</h2>
        <p className="mb-5 text-xs text-neutral-400">
          Share conversation threads as portable JSON files without needing WebRTC pairing.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-colors hover:border-cyan-500/40 hover:bg-neutral-900"
          >
            <div className="text-left">
              <span className="text-sm font-semibold text-neutral-200">Export Current Chat</span>
              <p className="text-[11px] text-neutral-500">Download formatted .json backup file</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-cyan-400">
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
          </button>

          {/* Import button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 transition-colors hover:border-teal-500/40 hover:bg-neutral-900"
          >
            <div className="text-left">
              <span className="text-sm font-semibold text-neutral-200">Import Chat File</span>
              <p className="text-[11px] text-neutral-500">Restore or load from .json backup</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-teal-400">
              <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v10.638l3.96-4.158a.75.75 0 1 1 1.08 1.04l-5.25 5.5a.75.75 0 0 1-1.08 0l-5.25-5.5a.75.75 0 1 1 1.08-1.04l3.96 4.158V3.75A.75.75 0 0 1 10 3Z" clipRule="evenodd" />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
