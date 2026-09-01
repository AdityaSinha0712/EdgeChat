import { useCallback, useEffect, useRef, useState } from 'react';

export type SpeechEngineMode = 'web-speech' | 'local-whisper';
export type LocalModelStatus = 'idle' | 'loading' | 'ready' | 'transcribing' | 'error';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  }
}

/**
 * Resamples raw mono Float32Array PCM audio from original sample rate to 16000Hz (Whisper format).
 */
function resampleTo16kHz(audioData: Float32Array, sampleRate: number): Float32Array<ArrayBuffer> {
  if (sampleRate === 16000) return audioData as Float32Array<ArrayBuffer>;
  const ratio = sampleRate / 16000;
  const newLength = Math.floor(audioData.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const origIndex = i * ratio;
    const idx1 = Math.floor(origIndex);
    const idx2 = Math.min(idx1 + 1, audioData.length - 1);
    const weight = origIndex - idx1;
    result[i] = audioData[idx1] * (1 - weight) + audioData[idx2] * weight;
  }
  return result as Float32Array<ArrayBuffer>;
}

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [engineMode, setEngineMode] = useState<SpeechEngineMode>('web-speech');
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [localModelStatus, setLocalModelStatus] = useState<LocalModelStatus>('idle');

  const webRecognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const isListeningRef = useRef(false);
  const engineModeRef = useRef<SpeechEngineMode>('web-speech');
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    engineModeRef.current = engineMode;
  }, [engineMode]);

  // Check Web Speech API browser availability
  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = Boolean(SpeechRecognitionClass);
    setIsWebSpeechSupported(supported);
    if (!supported) {
      setEngineMode('local-whisper');
    }
  }, []);

  // Lazy-create local Whisper Web Worker
  const getSpeechWorker = useCallback((): Worker => {
    if (!workerRef.current) {
      const worker = new Worker(
        new URL('../workers/speechWorker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (event: MessageEvent) => {
        const { type, text, status, message } = event.data;
        if (type === 'status') {
          setLocalModelStatus(status);
          if (status === 'error' && message) {
            setError(`Local AI error: ${message}`);
            setIsTranscribing(false);
          }
        } else if (type === 'result') {
          setIsTranscribing(false);
          setLocalModelStatus('ready');
          if (text) {
            onTranscriptRef.current(text);
            setError(null);
          } else {
            setInfoMessage('No speech detected in audio.');
            setTimeout(() => setInfoMessage(null), 3000);
          }
        } else if (type === 'error') {
          setIsTranscribing(false);
          setLocalModelStatus('ready');
          setError(`Local transcription error: ${message || 'Unknown failure'}`);
        }
      };

      workerRef.current = worker;
    }
    return workerRef.current;
  }, []);

  // Stop local microphone recording & send to Whisper worker
  const stopLocalRecording = useCallback(async () => {
    isListeningRef.current = false;
    setIsListening(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  // Process recorded audio blob
  const processRecordedAudio = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size === 0) return;
    setIsTranscribing(true);
    setLocalModelStatus('transcribing');

    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('AudioContext is not supported in this browser');
      }

      const audioCtx = new AudioCtx();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      let channelData = decodedBuffer.getChannelData(0);

      // Resample to 16kHz required by Whisper
      if (decodedBuffer.sampleRate !== 16000) {
        channelData = resampleTo16kHz(channelData, decodedBuffer.sampleRate);
      }

      await audioCtx.close();

      const worker = getSpeechWorker();
      const buffer = channelData.buffer as ArrayBuffer;
      worker.postMessage({ type: 'transcribe', audio: channelData }, [buffer]);
    } catch (err) {
      console.error('[SpeechRecognition] Local audio decoding failed:', err);
      setIsTranscribing(false);
      setLocalModelStatus('ready');
      setError('Failed to process recorded microphone audio');
    }
  }, [getSpeechWorker]);

  // Start local microphone recording
  const startLocalRecording = useCallback(async () => {
    setError(null);
    setInfoMessage(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        audioChunksRef.current = [];
        processRecordedAudio(fullBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(200); // 200ms slice interval
      isListeningRef.current = true;
      setIsListening(true);

      // Pre-load Whisper model in background while user speaks
      const worker = getSpeechWorker();
      if (localModelStatus === 'idle') {
        worker.postMessage({ type: 'load' });
      }
    } catch (err) {
      console.error('[SpeechRecognition] Local mic access failed:', err);
      isListeningRef.current = false;
      setIsListening(false);
      setError('Microphone permission denied or no audio device found.');
    }
  }, [getSpeechWorker, localModelStatus, processRecordedAudio]);

  // Stop Web Speech API listening
  const stopWebSpeech = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  // Start Web Speech API listening with automatic fallback on network error
  const startWebSpeech = useCallback(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setEngineMode('local-whisper');
      startLocalRecording();
      return;
    }

    setError(null);
    setInfoMessage(null);
    isListeningRef.current = true;
    setIsListening(true);

    try {
      if (webRecognitionRef.current) {
        try {
          webRecognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = navigator.language || 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let newTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            newTranscript += result[0].transcript.trim() + ' ';
          }
        }
        if (newTranscript) {
          onTranscriptRef.current(newTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[SpeechRecognition] Web Speech error:', event.error);
        if (event.error === 'no-speech') {
          return;
        }

        if (event.error === 'network' || event.error === 'service-not-allowed') {
          // Automatic fallback to local Whisper AI on network error or cloud blocked!
          console.info('[SpeechRecognition] Web Speech network error. Falling back to Local Whisper AI.');
          stopWebSpeech();
          setEngineMode('local-whisper');
          setInfoMessage('Cloud speech unavailable. Switched to Local Offline AI Speech.');
          setTimeout(() => setInfoMessage(null), 4000);
          startLocalRecording();
        } else if (event.error === 'not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          setError('Microphone access denied. Grant permission in browser settings.');
        } else if (event.error === 'audio-capture') {
          isListeningRef.current = false;
          setIsListening(false);
          setError('No microphone detected or mic is in use by another app.');
        } else {
          isListeningRef.current = false;
          setIsListening(false);
          setError(`Speech error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && engineModeRef.current === 'web-speech') {
          try {
            recognition.start();
          } catch {
            isListeningRef.current = false;
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      webRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[SpeechRecognition] Web speech start error:', err);
      // Fall back to local recording
      setEngineMode('local-whisper');
      startLocalRecording();
    }
  }, [startLocalRecording, stopWebSpeech]);

  // Master toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      if (engineMode === 'local-whisper') {
        stopLocalRecording();
      } else {
        stopWebSpeech();
      }
    } else {
      if (engineMode === 'local-whisper') {
        startLocalRecording();
      } else {
        startWebSpeech();
      }
    }
  }, [engineMode, isListening, startLocalRecording, startWebSpeech, stopLocalRecording, stopWebSpeech]);

  // Switch engine mode explicitly
  const switchEngineMode = useCallback((mode: SpeechEngineMode) => {
    if (isListening) {
      if (engineMode === 'local-whisper') stopLocalRecording();
      else stopWebSpeech();
    }
    setError(null);
    setEngineMode(mode);
  }, [engineMode, isListening, stopLocalRecording, stopWebSpeech]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      webRecognitionRef.current?.abort();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  return {
    isListening,
    isTranscribing,
    engineMode,
    isWebSpeechSupported,
    error,
    infoMessage,
    localModelStatus,
    toggleListening,
    switchEngineMode,
    clearError: () => setError(null),
  };
}
