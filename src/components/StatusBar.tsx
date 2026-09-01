interface StatusBarProps {
  isOnline: boolean;
  canInstall: boolean;
  onInstall: () => void;
}

export function StatusBar({ isOnline, canInstall, onInstall }: StatusBarProps) {
  // Only show when offline or installable
  if (isOnline && !canInstall) return null;

  return (
    <div className="flex shrink-0 items-center justify-center gap-4 border-b border-neutral-800/60 bg-neutral-900/50 px-4 py-2 text-xs backdrop-blur">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 text-amber-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.03 10.03 0 0 0 3.3-2.089.75.75 0 0 0-.04-1.1 11.42 11.42 0 0 0-3.009-1.99l-1.097-1.098A13.67 13.67 0 0 1 10 8.5c2.648 0 5.081.822 7.01 2.233a.75.75 0 0 0 .97-1.146A15.17 15.17 0 0 0 10 7c-1.553 0-3.045.235-4.449.668L3.28 2.22ZM7.29 6.36a.75.75 0 0 0-.5-1.416A15.193 15.193 0 0 0 .386 9.587a.75.75 0 0 0 .04 1.1A11.387 11.387 0 0 0 4.49 12.76l.96.96a.75.75 0 0 0 .072-.076 8.89 8.89 0 0 1 3.328-2.27.75.75 0 0 0-.27-1.448 10.38 10.38 0 0 0-1.29.246Z"
              clipRule="evenodd"
            />
            <path d="M10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
          </svg>
          <span>Offline — chat still works with cached model</span>
        </div>
      )}

      {/* Install prompt */}
      {canInstall && (
        <button
          onClick={onInstall}
          id="install-app-button"
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600/20 px-3 py-1 text-cyan-300 transition-colors hover:bg-cyan-600/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
          >
            <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
            <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
          </svg>
          Install app
        </button>
      )}
    </div>
  );
}
