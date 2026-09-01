interface WebGPUUnsupportedProps {
  reason: string;
}

export function WebGPUUnsupported({ reason }: WebGPUUnsupportedProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-8 w-8 text-red-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>

      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold text-neutral-200">
          WebGPU Not Available
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          {reason}
        </p>
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-left text-xs text-neutral-500">
          <p className="mb-2 font-medium text-neutral-400">
            Supported browsers:
          </p>
          <ul className="space-y-1">
            <li>• Chrome / Edge 113+ (desktop)</li>
            <li>• Chrome 121+ (Android)</li>
            <li>• Safari — experimental support</li>
            <li>• Firefox — not yet supported</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
