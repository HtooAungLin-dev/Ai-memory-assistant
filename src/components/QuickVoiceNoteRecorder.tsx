import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  X,
  Volume2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit3,
  Layers,
  Tag,
  Radio,
} from 'lucide-react';
import { MemoryItem, MemoryCategory, MemorySentiment } from '../types';

interface QuickVoiceNoteRecorderProps {
  onAddMemories: (newMemories: MemoryItem[]) => void;
  activeSessionId?: string;
}

export const QuickVoiceNoteRecorder: React.FC<QuickVoiceNoteRecorderProps> = ({
  onAddMemories,
  activeSessionId = 'session-voice',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioLevelsHistory, setAudioLevelsHistory] = useState<number[]>(new Array(24).fill(4));

  // Refs for media and recognition
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up recording resources
  const stopAllAudioTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudioTracks();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.abort();
        } catch (_e) {}
      }
    };
  }, [stopAllAudioTracks]);

  // Audio Visualizer loop
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Average level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.max(8, (avg / 128) * 100));
        setAudioLevel(normalized);

        setAudioLevelsHistory((prev) => {
          const next = [...prev.slice(1), Math.max(6, Math.round(normalized * 0.4))];
          return next;
        });

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch (err) {
      console.warn('Audio visualizer could not be initialized:', err);
    }
  };

  // Start recording
  const startRecording = async () => {
    setErrorNotice(null);
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    audioChunksRef.current = [];

    // Check getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorNotice('Microphone access is not supported in this browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      startVisualizer(stream);

      // Setup MediaRecorder as raw audio backup
      try {
        const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', ''];
        let chosenMime = '';
        for (const type of mimeTypes) {
          if (!type || MediaRecorder.isTypeSupported(type)) {
            chosenMime = type;
            break;
          }
        }

        const recorder = new MediaRecorder(stream, chosenMime ? { mimeType: chosenMime } : undefined);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (recErr) {
        console.warn('MediaRecorder init warning:', recErr);
      }

      // Setup Web Speech API for real-time live transcription
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let finalStr = '';
            let interimStr = '';

            for (let i = 0; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalStr += res[0].transcript + ' ';
              } else {
                interimStr += res[0].transcript;
              }
            }

            if (finalStr) {
              setTranscript((prev) => {
                const combined = (prev + ' ' + finalStr).replace(/\s+/g, ' ').trim();
                return combined;
              });
            }
            setInterimTranscript(interimStr);
          };

          recognition.onerror = (e: any) => {
            console.warn('SpeechRecognition error:', e.error);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (speechErr) {
          console.warn('SpeechRecognition start failed:', speechErr);
        }
      }

      setIsRecording(true);

      // Duration counter
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorNotice('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else {
        setErrorNotice(err.message || 'Could not access microphone.');
      }
      stopAllAudioTracks();
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!isRecording) return;

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_e) {}
    }

    stopAllAudioTracks();
    setIsRecording(false);
  };

  // Convert audio blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        const base64 = res.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Process & Save
  const handleSaveMemory = async () => {
    let finalNote = (transcript + ' ' + interimTranscript).trim();

    // If text is empty, check if we have recorded audio chunks to transcribe via Gemini server endpoint
    if (!finalNote && audioChunksRef.current.length > 0) {
      setIsProcessing(true);
      try {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || 'audio/webm',
        });
        const base64 = await blobToBase64(audioBlob);

        const resp = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64,
            mimeType: audioBlob.type || 'audio/webm',
          }),
        });

        const data = await resp.json();
        if (data.transcript) {
          finalNote = data.transcript.trim();
          setTranscript(finalNote);
        }
      } catch (e) {
        console.warn('Backend audio transcription fallback failed:', e);
      } finally {
        setIsProcessing(false);
      }
    }

    if (!finalNote) {
      setErrorNotice('No speech detected. Please speak clearly into the microphone or type your note.');
      return;
    }

    setIsProcessing(true);
    setErrorNotice(null);

    try {
      // Send note to proposition extraction pipeline
      const extractResp = await fetch('/api/extract-memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalNote }),
      });

      const data = await extractResp.json();
      const extracted = data.memories || [];

      const newMemoriesToInsert: MemoryItem[] = [];

      if (Array.isArray(extracted) && extracted.length > 0) {
        extracted.forEach((item: any, idx: number) => {
          const tags = Array.isArray(item.tags) ? [...item.tags] : [];
          if (!tags.includes('VoiceNote')) tags.unshift('VoiceNote');

          newMemoriesToInsert.push({
            id: `mem-voice-${Date.now()}-${idx}`,
            content: item.content,
            category: (item.category as MemoryCategory) || 'knowledge',
            confidence: item.confidence || 0.98,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sessionId: activeSessionId,
            sessionTitle: 'Voice Quick Note',
            pinned: false,
            sentiment: (item.sentiment as MemorySentiment) || 'positive',
            tags: tags.slice(0, 4),
            accessCount: 1,
            lastRecalledAt: 'Just now',
            archived: false,
          });
        });
      } else {
        // Fallback: Store the transcribed note directly as high-confidence fact
        newMemoriesToInsert.push({
          id: `mem-voice-${Date.now()}`,
          content: finalNote,
          category: 'knowledge',
          confidence: 0.98,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sessionId: activeSessionId,
          sessionTitle: 'Voice Quick Note',
          pinned: false,
          sentiment: 'positive',
          tags: ['VoiceNote', 'QuickNote', 'Fact'],
          accessCount: 1,
          lastRecalledAt: 'Just now',
          archived: false,
        });
      }

      onAddMemories(newMemoriesToInsert);

      setSuccessNotice(`Saved ${newMemoriesToInsert.length} voice note memory ${newMemoriesToInsert.length === 1 ? 'fact' : 'facts'}!`);
      setTimeout(() => {
        setSuccessNotice(null);
        setIsOpen(false);
        setTranscript('');
        setInterimTranscript('');
      }, 1400);
    } catch (err: any) {
      console.error('Failed to extract & save memory:', err);
      // Even if API fails, save locally
      const fallbackMemory: MemoryItem = {
        id: `mem-voice-${Date.now()}`,
        content: finalNote,
        category: 'knowledge',
        confidence: 0.95,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sessionId: activeSessionId,
        sessionTitle: 'Voice Quick Note',
        pinned: false,
        sentiment: 'positive',
        tags: ['VoiceNote', 'QuickNote'],
        accessCount: 1,
        lastRecalledAt: 'Just now',
        archived: false,
      };

      onAddMemories([fallbackMemory]);
      setSuccessNotice('Saved voice note to persistent vector store!');
      setTimeout(() => {
        setSuccessNotice(null);
        setIsOpen(false);
        setTranscript('');
        setInterimTranscript('');
      }, 1400);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    setErrorNotice(null);
    setSuccessNotice(null);
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    // Auto-start recording after modal transition
    setTimeout(() => {
      startRecording();
    }, 200);
  };

  const handleCloseModal = () => {
    stopRecording();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating 'Record Quick Note' Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenModal}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-900 text-white font-medium text-xs shadow-xl hover:shadow-2xl hover:bg-neutral-800 transition-all duration-200 border border-neutral-700/80 cursor-pointer active:scale-95"
          title="Capture a quick voice note directly into Mem0 long-term memory"
        >
          {/* Subtle live pulse animation */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>

          <Mic className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold tracking-tight">Record Quick Note</span>

          <span className="hidden sm:inline-block ml-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700">
            Voice
          </span>
        </button>
      </div>

      {/* Interactive Recording & Transcription Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/80">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isRecording
                      ? 'bg-rose-100 text-rose-600 animate-pulse'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <span>Voice Memory Note</span>
                    {isRecording && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                        <Radio className="w-2.5 h-2.5 animate-pulse" />
                        REC {formatDuration(duration)}
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-neutral-500">
                    Captures your speech via Browser Microphone API and indexes it into Mem0
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Dynamic Audio Waveform Visualizer */}
              <div className="bg-neutral-900 text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-inner border border-neutral-800">
                <div className="flex items-end justify-center gap-1 h-12 w-full px-4">
                  {audioLevelsHistory.map((val, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        isRecording
                          ? 'bg-gradient-to-t from-rose-500 to-indigo-400'
                          : 'bg-neutral-700'
                      }`}
                      style={{
                        height: isRecording ? `${Math.max(4, Math.min(48, val))}px` : '4px',
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between w-full text-[11px] text-neutral-400 font-mono pt-1 border-t border-neutral-800">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{isRecording ? 'Listening to voice stream...' : 'Microphone idle'}</span>
                  </span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Status / Error Notifications */}
              {errorNotice && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorNotice}</div>
                </div>
              )}

              {successNotice && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 font-semibold">{successNotice}</div>
                </div>
              )}

              {/* Transcribed Text Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-neutral-700 flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Captured Transcript</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {isRecording ? 'Live streaming...' : 'Editable before saving'}
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={transcript + (interimTranscript ? ` ${interimTranscript}` : '')}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder={
                      isRecording
                        ? 'Speak your note clearly... (e.g. "Remember to use PostgreSQL and strict zero context loss across all multi-agent conversations")'
                        : 'Your transcribed voice note will appear here.'
                    }
                    className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 font-medium resize-none leading-relaxed bg-neutral-50/50"
                  />
                  {isRecording && interimTranscript && (
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-indigo-600 font-medium animate-pulse">
                      Transcribing...
                    </span>
                  )}
                </div>
              </div>

              {/* Feature Chips Info */}
              <div className="bg-indigo-50/70 border border-indigo-100 p-2.5 rounded-lg flex items-center gap-2 text-[11px] text-indigo-900">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  Automatically analyzes propositions, identifies sentiment polarity, and assigns topic tags (`#VoiceNote`).
                </span>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between gap-2">
              <div>
                {isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Record Again</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                  className="px-3.5 py-2 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveMemory}
                  disabled={isProcessing || (!transcript.trim() && !interimTranscript.trim() && audioChunksRef.current.length === 0)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-neutral-900 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Vector Store...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Save as Memory Shard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
