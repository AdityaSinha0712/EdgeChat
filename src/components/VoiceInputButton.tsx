import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../lib/useSpeechRecognition';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({
  onTranscript,
  disabled = false,
}: VoiceInputButtonProps) {
  const {
    isListening,
    isTranscribing,
    engineMode,
    isWebSpeechSupported,
    error,
    infoMessage,
    localModelStatus,
    toggleListening,
    switchEngineMode,
    clearError,
  } = useSpeechRecognition(onTranscript);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close engine selection menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const isLocalMode = engineMode === 'local-whisper';

  return (
    <div className="relative flex items-center" ref={menuRef}>
      {/* Primary Voice Recording Button */}
      <button
        type="button"
        onClick={() => {
          if (error) clearError();
          toggleListening();
        }}
        disabled={disabled || isTranscribing}
        title={
          isTranscribing
            ? 'Transcribing audio with Local Whisper AI...'
            : isListening
            ? 'Click to stop listening'
            : isLocalMode
            ? 'Start dictation (Local Whisper AI)'
            : 'Start dictation (Web Speech)'
        }
        aria-label={
          isTranscribing
            ? 'Transcribing audio'
            : isListening
            ? 'Stop listening'
            : 'Start voice dictation'
        }
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
          error
            ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 hover:border-amber-400'
            : isListening
            ? 'border-red-500/50 bg-red-500/20 text-red-400 shadow-md shadow-red-900/30'
            : isTranscribing
            ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300 animate-pulse'
            : isLocalMode
            ? 'border-cyan-700/60 bg-neutral-900/90 text-cyan-400 hover:border-cyan-500/60 hover:text-cyan-200'
            : 'border-neutral-700/50 bg-neutral-900 text-neutral-400 hover:border-cyan-500/40 hover:text-cyan-300'
        }`}
      >
        {isListening && (
          <span className="absolute inset-0 animate-ping rounded-xl bg-red-500/20" />
        )}

        {isTranscribing ? (
          // Transcribing Spinner Icon
          <svg className="h-5 w-5 animate-spin text-cyan-400 z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          // Microphone Icon
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5 z-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 0 3-3V4.5a3 3 0 0 0-6 0v8.25a3 3 0 0 0 3 3Z" />
          </svg>
        )}

        {/* Engine mode badge indicator (Small AI badge for local Whisper) */}
        {isLocalMode && !isTranscribing && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-600 text-[8px] font-bold text-white shadow">
            ⚡
          </span>
        )}
      </button>

      {/* Engine Options Toggle Button */}
      <button
        type="button"
        onClick={() => setShowMenu((prev) => !prev)}
        title="Speech recognition settings"
        aria-label="Speech recognition settings"
        className="ml-0.5 flex h-4 w-4 items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Status & Error Floating Toast */}
      {(error || infoMessage || isTranscribing || isListening) && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 text-xs border shadow-xl z-30 pointer-events-none transition-all duration-200">
          {error ? (
            <span className="text-amber-300 flex items-center gap-1.5">
              <span>⚠️</span> {error}
            </span>
          ) : infoMessage ? (
            <span className="text-cyan-300 flex items-center gap-1.5">
              <span>ℹ️</span> {infoMessage}
            </span>
          ) : isTranscribing ? (
            <span className="text-cyan-400 flex items-center gap-1.5">
              <span className="inline-block animate-spin">⏳</span> Transcribing audio with Local Whisper AI...
            </span>
          ) : isListening ? (
            <span className={isLocalMode ? "text-cyan-300 flex items-center gap-1.5" : "text-red-400 flex items-center gap-1.5"}>
              <span className="h-2 w-2 rounded-full bg-current animate-ping" />
              {isLocalMode
                ? localModelStatus === 'loading'
                  ? 'Loading local Whisper model...'
                  : 'Recording audio (Local Whisper AI)... Click mic to stop & transcribe'
                : 'Listening (Web Speech)... Speak into mic'}
            </span>
          ) : null}
        </div>
      )}

      {/* Engine Selection Popover Menu */}
      {showMenu && (
        <div className="absolute bottom-full mb-2 right-0 w-64 rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-xl p-2 shadow-2xl z-40 text-xs">
          <div className="px-2 py-1 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
            Speech Recognition Engine
          </div>
          <div className="mt-1 space-y-1">
            <button
              type="button"
              onClick={() => {
                switchEngineMode('web-speech');
                setShowMenu(false);
              }}
              disabled={!isWebSpeechSupported}
              className={`w-full flex items-start gap-2 rounded-lg p-2 text-left transition-colors ${
                engineMode === 'web-speech'
                  ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/30'
                  : 'hover:bg-neutral-800/80 text-neutral-300'
              } ${!isWebSpeechSupported ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <span className="text-sm mt-0.5">🌐</span>
              <div className="flex-1">
                <div className="font-medium flex items-center justify-between">
                  <span>Web Speech API</span>
                  {engineMode === 'web-speech' && <span className="text-[10px] text-cyan-400 font-bold">Active</span>}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {isWebSpeechSupported
                    ? 'Cloud-powered streaming STT (Requires network connection)'
                    : 'Not supported in this browser'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                switchEngineMode('local-whisper');
                setShowMenu(false);
              }}
              className={`w-full flex items-start gap-2 rounded-lg p-2 text-left transition-colors ${
                engineMode === 'local-whisper'
                  ? 'bg-cyan-950/60 text-cyan-200 border border-cyan-500/30'
                  : 'hover:bg-neutral-800/80 text-neutral-300'
              }`}
            >
              <span className="text-sm mt-0.5">⚡</span>
              <div className="flex-1">
                <div className="font-medium flex items-center justify-between">
                  <span>Local Whisper AI</span>
                  {engineMode === 'local-whisper' && <span className="text-[10px] text-cyan-400 font-bold">Active</span>}
                </div>
                <div className="text-[10px] text-neutral-400">
                  100% offline & private in-browser transcription using WASM
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
