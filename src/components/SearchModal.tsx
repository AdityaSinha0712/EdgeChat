import { useState } from 'react';
import { searchChatHistory, type SearchMatch } from '../lib/search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (conversationId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  onSelectMatch,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  async function handleSearch(text: string) {
    setQuery(text);
    if (!text.trim()) {
      setMatches([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchChatHistory(text);
      setMatches(results);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-neutral-500">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search across all conversations…"
            autoFocus
            className="flex-1 bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search results */}
        <div className="max-h-80 overflow-y-auto pt-2 space-y-1">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-neutral-500">Searching…</div>
          ) : query && matches.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">No matching messages found</div>
          ) : (
            matches.map((match) => (
              <button
                key={match.message.id}
                onClick={() => {
                  onSelectMatch(match.conversation.id);
                  onClose();
                }}
                className="group flex w-full flex-col gap-1 rounded-xl p-3 text-left transition-colors hover:bg-neutral-900/60"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-400">{match.conversation.title}</span>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(match.message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-300">
                  {match.snippet}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
