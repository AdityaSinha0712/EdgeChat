export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-2">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/20 text-xs font-semibold text-teal-300">
        AI
      </div>
      {/* Dots */}
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-neutral-800/80 px-4 py-3 ring-1 ring-white/5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-500 [animation-delay:300ms]" />
      </div>
    </div>
  );
}
