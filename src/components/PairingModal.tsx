import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  shortCode: string;
  onAdoptRoomId: (newRoomId: string) => void;
  onReset: () => void;
}

/**
 * Modal for pairing two devices.
 *
 * Shows:
 * - A QR code encoding the current device's room ID
 * - The short pairing code for manual entry
 * - An input to type another device's full room ID (from QR or manual)
 */
export function PairingModal({
  isOpen,
  onClose,
  roomId,
  shortCode,
  onAdoptRoomId,
  onReset,
}: PairingModalProps) {
  const [pairInput, setPairInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Generate QR code when modal opens
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(roomId, {
      width: 200,
      margin: 2,
      color: {
        dark: '#e5e5e5',
        light: '#0a0a0a',
      },
      errorCorrectionLevel: 'M',
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [isOpen, roomId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API might not be available
    }
  }, [roomId]);

  const handlePair = useCallback(() => {
    const trimmed = pairInput.trim().toLowerCase();
    if (!trimmed) return;
    onAdoptRoomId(trimmed);
    setPairInput('');
    onClose();
  }, [pairInput, onAdoptRoomId, onClose]);

  const handleReset = useCallback(() => {
    onReset();
    setShowConfirmReset(false);
    onClose();
  }, [onReset, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950/95 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 transition-colors hover:text-neutral-300"
          aria-label="Close pairing modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-lg font-bold text-neutral-100">
            Pair Devices
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Scan this QR code on your other device, or enter its code below.
          </p>
        </div>

        {/* QR Code */}
        <div className="mb-5 flex flex-col items-center gap-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Pairing QR code"
                className="h-[200px] w-[200px]"
              />
            ) : (
              <div className="flex h-[200px] w-[200px] items-center justify-center text-neutral-600">
                Generating…
              </div>
            )}
          </div>

          {/* Short code display */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Your code:</span>
            <code className="rounded-md bg-neutral-800/80 px-3 py-1 font-mono text-sm font-bold tracking-widest text-cyan-400">
              {shortCode}
            </code>
          </div>

          {/* Full room ID with copy */}
          <button
            onClick={handleCopy}
            className="group flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            title="Copy full room ID"
          >
            <span className="max-w-[240px] truncate font-mono text-[11px]">
              {roomId}
            </span>
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-emerald-400">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100">
                <path fillRule="evenodd" d="M15.988 3.012A2.25 2.25 0 0 0 14.25 2h-4.5A2.25 2.25 0 0 0 7.5 4.25v.75H5.75A2.25 2.25 0 0 0 3.5 7.25v8.5A2.25 2.25 0 0 0 5.75 18h4.5A2.25 2.25 0 0 0 12.5 15.75v-.75h1.75a2.25 2.25 0 0 0 2.25-2.25v-8.5a2.25 2.25 0 0 0-.512-1.238Z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-neutral-950 px-3 text-neutral-500">
              or enter the other device's code
            </span>
          </div>
        </div>

        {/* Pair input */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={pairInput}
            onChange={(e) => setPairInput(e.target.value)}
            placeholder="Paste room ID from other device"
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePair();
            }}
          />
          <button
            onClick={handlePair}
            disabled={!pairInput.trim()}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600"
          >
            Pair
          </button>
        </div>

        {/* Unpair / reset */}
        <div className="flex justify-end">
          {showConfirmReset ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-amber-400">Generate new ID? This will unpair all devices.</span>
              <button
                onClick={handleReset}
                className="rounded-md bg-red-600/80 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-500"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
            >
              Unpair & generate new ID
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
