import { useCallback, useRef, useState, type DragEvent } from 'react';
import type { DocumentInfo } from '../lib/ragStore';
import type { EmbeddingStatus } from '../lib/useEmbeddings';
import { ACCEPTED_FILE_TYPES, isSupportedFile } from '../lib/fileProcessor';

interface FileDropZoneProps {
  documents: DocumentInfo[];
  embeddingStatus: EmbeddingStatus;
  embeddingProgress: { current: number; total: number } | null;
  onAddFile: (file: File) => Promise<void>;
  onRemoveDocument: (name: string) => void;
  processingFile: string | null;
}

export function FileDropZone({
  documents,
  embeddingStatus,
  embeddingProgress,
  onAddFile,
  onRemoveDocument,
  processingFile,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files ?? []);
      for (const file of files) {
        if (isSupportedFile(file)) {
          await onAddFile(file);
        }
      }
    },
    [onAddFile],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      for (const file of files) {
        if (isSupportedFile(file)) {
          await onAddFile(file);
        }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [onAddFile],
  );

  const isProcessing = processingFile !== null;

  return (
    <div className="space-y-2">
      {/* Document chips */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {documents.map((doc) => (
            <span
              key={doc.name}
              className="group flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[11px] text-cyan-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3 shrink-0 text-cyan-400/60"
              >
                <path d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6.414A2 2 0 0 0 13.414 5L11 2.586A2 2 0 0 0 9.586 2H4Z" />
              </svg>
              <span className="max-w-[120px] truncate">{doc.name}</span>
              <span className="text-cyan-400/40">({doc.chunkCount})</span>
              <button
                onClick={() => onRemoveDocument(doc.name)}
                className="ml-0.5 rounded p-0.5 text-cyan-400/40 transition-colors hover:text-red-400"
                aria-label={`Remove ${doc.name}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Processing status */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-[11px] text-cyan-300/70">
          <div className="h-3 w-3 animate-spin rounded-full border border-cyan-500/30 border-t-cyan-400" />
          <span>
            {embeddingStatus === 'loading'
              ? 'Loading embedding model…'
              : embeddingProgress
                ? `Embedding chunk ${embeddingProgress.current}/${embeddingProgress.total} of ${processingFile}…`
                : `Processing ${processingFile}…`}
          </span>
        </div>
      )}

      {/* Drop zone (collapsible — only shown when no docs yet or dragging) */}
      {(documents.length === 0 || isDragOver) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3 text-xs transition-colors ${
            isDragOver
              ? 'border-cyan-400/50 bg-cyan-500/5 text-cyan-300'
              : 'border-neutral-700/50 text-neutral-500 hover:border-cyan-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-cyan-400/70 shrink-0"
            >
              <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            <span>
              {isDragOver
                ? 'Drop PDF or TXT files here'
                : 'Drop PDF or TXT files for grounded Q&A'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-neutral-700 bg-neutral-800/80 px-2.5 py-1 text-xs text-neutral-300 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
            >
              Choose Files
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload files for RAG"
      />
    </div>
  );
}
