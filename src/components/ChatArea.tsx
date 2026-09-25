import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Brain,
  Sparkles,
  Bot,
  User,
  History,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Layers,
  ChevronDown,
  Info,
  Mic,
  MicOff,
  Radio,
  Volume2,
} from 'lucide-react';
import { ChatMessage, MemoryItem, Session } from '../types';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  activeSession: Session;
  memories: MemoryItem[];
  onSelectMemoryForInspection: (mem: MemoryItem) => void;
  recentlyExtractedMemories: MemoryItem[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  isLoading,
  activeSession,
  memories,
  onSelectMemoryForInspection,
  recentlyExtractedMemories,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('Gemini 3.8 Flash + Mem0');
  
  // Web Speech API Voice-to-Text state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptSegment = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcriptSegment;
          } else {
            interimChunk += transcriptSegment;
          }
        }

        if (finalChunk) {
          setInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalChunk.trim()}` : finalChunk.trim();
          });
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimChunk);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          // Handled gracefully
        } else {
          setSpeechError(`Voice recognition: ${event.error || 'Speech error'}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Failed to initialize SpeechRecognition:', err);
      setIsSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_e) {}
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!isSpeechSupported) {
      setSpeechError('Voice dictation is not supported by your current browser.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_e) {}
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        textareaRef.current?.focus();
      } catch (err: any) {
        console.warn('Could not start recognition:', err);
        // If already started, restart
        try {
          recognitionRef.current?.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch (_err) {}
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_e) {}
      setIsListening(false);
    }

    onSendMessage(input.trim());
    setInput('');
    setInterimTranscript('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50/60 overflow-hidden relative">
      {/* Top Session Context Bar */}
      <div className="h-12 border-b border-neutral-200/80 bg-white/80 backdrop-blur-xs px-4 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2 truncate">
          <History className="w-3.5 h-3.5 text-neutral-400" />
          <span className="font-semibold text-neutral-900 truncate">
            {activeSession.title}
          </span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-500 font-normal truncate hidden sm:inline">
            Active session with {memories.length} persistent long-term memories
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Memory Active</span>
          </div>
        </div>
      </div>

      {/* Real-time Memory Extraction Notification Banner */}
      {recentlyExtractedMemories.length > 0 && (
        <div className="bg-indigo-50 border-b border-indigo-200/80 px-4 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-indigo-900 truncate">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold">New Long-Term Memory Indexed:</span>
            <span className="truncate italic">
              "{recentlyExtractedMemories[recentlyExtractedMemories.length - 1].content}"
            </span>
          </div>
          <span className="text-[10px] text-indigo-600 font-mono shrink-0 ml-2">
            Committed to Mem0 Graph
          </span>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-neutral-900 text-white'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
              </div>

              {/* Message Content Container */}
              <div className={`space-y-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Sender & Timestamp */}
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 px-1">
                  <span className="font-semibold text-neutral-700">
                    {isUser ? 'You' : msg.agentName || 'AI Assistant'}
                  </span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-neutral-900 text-white rounded-tr-xs'
                      : 'bg-white text-neutral-800 border border-neutral-200/80 shadow-2xs rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Recalled Memory Citations */}
                  {!isUser && msg.recalledMemories && msg.recalledMemories.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-700 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Recalled Cross-Session Context:</span>
                      </div>
                      <div className="space-y-1">
                        {msg.recalledMemories.map((recalled, idx) => {
                          const matchedMemory = memories.find((m) =>
                            m.content.toLowerCase().includes(recalled.toLowerCase().slice(0, 20))
                          );
                          return (
                            <div
                              key={idx}
                              onClick={() => matchedMemory && onSelectMemoryForInspection(matchedMemory)}
                              className="p-1.5 rounded bg-indigo-50/70 border border-indigo-200/50 text-indigo-950 font-normal hover:bg-indigo-100/70 transition-colors cursor-pointer flex items-center justify-between group"
                              title="Click to view full memory details in inspector"
                            >
                              <span className="truncate">"{recalled}"</span>
                              <span className="text-[9px] text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono shrink-0 ml-2">
                                Inspect Node →
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="flex items-center gap-2 px-1 text-[10px] text-neutral-400">
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.content)}
                    className="hover:text-neutral-700 flex items-center gap-1 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-neutral-500 bg-white border border-neutral-200/80 p-3.5 rounded-xl max-w-sm shadow-2xs">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin" />
            <div>
              <p className="font-semibold text-neutral-800">Recalling Long-Term Context...</p>
              <p className="text-[10px] text-neutral-400">Querying Mem0 vector graph and applying user constraints.</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Message Input Box with Web Speech Dictation */}
      <div className="p-4 bg-white border-t border-neutral-200/80">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
          {/* Quick prompt suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-neutral-600 no-scrollbar">
            <span className="text-[10px] text-neutral-400 uppercase font-bold shrink-0">Try:</span>
            <button
              type="button"
              onClick={() => onSendMessage('What do you remember about my identity, name, and preferences?')}
              className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shrink-0 transition-colors"
            >
              "What do you remember about me?"
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('What tech stack and frameworks did we establish previously?')}
              className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shrink-0 transition-colors"
            >
              "Recall tech stack"
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('Remember this: My priority for this sprint is finishing the multi-agent memory workflows.')}
              className="px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 shrink-0 transition-colors"
            >
              "+ Add sprint goal memory"
            </button>
          </div>

          {/* Active Voice Dictation Status Banner */}
          {isListening && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <span className="font-semibold">Voice Dictation Active:</span>
                <span className="text-[11px] text-rose-700 italic">
                  {interimTranscript ? `"${interimTranscript}"` : 'Listening for memories or questions...'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-rose-100/70 hover:bg-rose-200 px-2 py-0.5 rounded transition-colors"
              >
                Stop Mic
              </button>
            </div>
          )}

          {/* Speech Error Notice */}
          {speechError && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
              <span>{speechError}</span>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-amber-600 hover:text-amber-900 font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          {/* Textarea + Action Bar */}
          <div
            className={`rounded-xl border bg-white shadow-2xs transition-all p-2 ${
              isListening
                ? 'border-rose-400 ring-2 ring-rose-100'
                : 'border-neutral-200 focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-200'
            }`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? 'Listening... speak clearly to dictate memories or prompts directly into chat stream.'
                  : "Ask anything or dictate context (e.g. 'My name is...', 'I prefer Tailwind CSS', 'What did we decide?')..."
              }
              rows={2}
              className="w-full text-xs text-neutral-800 placeholder-neutral-400 bg-transparent resize-none outline-none p-1.5 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <span className="flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold text-neutral-700">{selectedModel}</span>
                </span>
                <span>·</span>
                <span className="text-neutral-400">Shift + Enter for new line</span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Voice-to-Text Microphone Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white shadow-xs animate-pulse ring-2 ring-rose-200'
                      : 'border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-600'
                  }`}
                  title={
                    !isSpeechSupported
                      ? 'Web Speech API is not supported in this browser'
                      : isListening
                      ? 'Click to stop voice dictation'
                      : 'Dictate memory or prompt via Web Speech API'
                  }
                >
                  {isListening ? (
                    <>
                      <Mic className="w-3.5 h-3.5 text-white" />
                      <span className="text-[10px] font-bold pr-0.5">Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-800" />
                      <span className="text-[10px] hidden sm:inline text-neutral-600">Dictate</span>
                    </>
                  )}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Send</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
