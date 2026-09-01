import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react';
import { VoiceInputButton } from './VoiceInputButton';

interface ComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function Composer({ onSend, disabled = false }: ComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    // Auto-grow, max ~6 lines
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }

  function handleVoiceTranscript(text: string) {
    setValue((prev) => {
      const space = prev && !prev.endsWith(' ') ? ' ' : '';
      return `${prev}${space}${text}`;
    });
  }

  const isEmpty = value.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-neutral-800/60 bg-neutral-950/80 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3"
    >
      <div className="mx-auto flex max-w-3xl items-end gap-2.5 sm:gap-3">
        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            id="chat-composer"
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            disabled={disabled}
            placeholder="Type a message…"
            aria-label="Message input"
            className="w-full resize-none rounded-xl border border-neutral-700/50 bg-neutral-900 px-4 py-3 pr-12 text-base sm:text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/25 disabled:opacity-50"
          />
        </div>

        {/* Voice dictation button */}
        <VoiceInputButton
          onTranscript={handleVoiceTranscript}
          disabled={disabled}
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={isEmpty || disabled}
          aria-label="Send message"
          id="send-button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white transition-all hover:bg-cyan-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-cyan-600 shadow-md shadow-cyan-900/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
