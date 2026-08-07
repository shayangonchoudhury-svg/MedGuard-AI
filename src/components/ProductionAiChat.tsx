import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, User, Send, Copy, Check, RotateCcw, Trash2, Plus, MessageSquare,
  Sparkles, RefreshCw, BarChart2, Clock, PanelLeftOpen, PanelLeftClose, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { aiService } from '../services/aiService';
import { Equipment } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

interface ProductionAiChatProps {
  equipmentList?: Equipment[];
}

const STORAGE_KEY = 'medguard_ai_chat_conversations_v1';

const SUGGESTED_PROMPTS = [
  { label: 'Calibration Overdue', prompt: 'Which medical devices are overdue for calibration across departments?' },
  { label: 'Predictive Failure Risk', prompt: 'Predict high-risk failure devices in ICU and Emergency.' },
  { label: 'Compliance Audit', prompt: 'Provide an ISO 13485 audit readiness summary for hospital assets.' },
  { label: 'Maintenance Checklist', prompt: 'Generate a step-by-step PM maintenance checklist for ventilators.' },
];

const CHART_COLORS = ['#00f2fe', '#4facfe', '#667eea', '#f093fb', '#f6d365', '#ff0844'];

export default function ProductionAiChat({ equipmentList = [] }: ProductionAiChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat history from localStorage:', e);
    }
    const defaultThread: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'New Biomedical Session',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: 'welcome-1',
          role: 'assistant',
          text: `Hello! I am **MedGuard AI Assistant**, powered by Google Gemini. 

I have live context of **${equipmentList.length || 'hospital'} biomedical assets** currently in system database.

### 🚀 Capabilities:
* **ISO 13485 / FDA Compliance Audit**: Analyze calibration gaps and regulatory readiness.
* **Predictive Failure Analytics**: Identify aging battery/sensor risks.
* **Maintenance Scheduling**: Generate PM checklists and engineering work order guides.

How can I help you manage your medical equipment today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    return [defaultThread];
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => conversations[0]?.id || '');
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  // Active conversation object
  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const messages = activeConv?.messages || [];

  // Save to LocalStorage whenever conversations change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Failed to save chat history to localStorage:', e);
    }
  }, [conversations]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Create new conversation
  const handleNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New Chat',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          text: 'Hello! Starting a new MedGuard AI session. What biomedical assets or compliance rules shall we discuss?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newId);
  };

  // Delete conversation
  const handleDeleteChat = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (conversations.length <= 1) {
      // Just clear messages if it's the last one
      handleClearChat();
      return;
    }
    const filtered = conversations.filter(c => c.id !== convId);
    setConversations(filtered);
    if (activeConvId === convId) {
      setActiveConvId(filtered[0].id);
    }
  };

  // Clear messages in active chat
  const handleClearChat = () => {
    if (!activeConvId) return;
    setConversations(prev =>
      prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            title: 'Cleared Session',
            messages: [
              {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                text: 'Chat history cleared. How can MedGuard AI assist you now?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
        }
        return c;
      })
    );
  };

  // Copy assistant response
  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Copy code block
  const handleCopyCode = (code: string, codeId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Send message with strict request locking
  const handleSendMessage = async (overridePrompt?: string) => {
    if (isStreaming || isSendingRef.current || !activeConvId) return;
    const query = (overridePrompt || chatInput).trim();
    if (!query) return;

    isSendingRef.current = true;
    setIsStreaming(true);

    try {
      const userMsg: ChatMessage = {
        id: `usr-${Date.now()}`,
        role: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const assistantMsgId = `ast-${Date.now()}`;
      const initialAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Update conversation title if first real prompt
      const updatedTitle = activeConv.messages.length <= 2
        ? (query.length > 25 ? query.substring(0, 25) + '...' : query)
        : activeConv.title;

      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConvId) {
            return {
              ...c,
              title: updatedTitle,
              messages: [...c.messages, userMsg, initialAssistantMsg],
            };
          }
          return c;
        })
      );

      setChatInput('');

      const historyForAi = activeConv.messages.map(m => ({ role: m.role, content: m.text }));

      await aiService.chatStream(
        query,
        historyForAi,
        { equipment: equipmentList },
        (chunk) => {
          setConversations(prev =>
            prev.map(c => {
              if (c.id === activeConvId) {
                return {
                  ...c,
                  messages: c.messages.map(msg =>
                    msg.id === assistantMsgId ? { ...msg, text: msg.text + chunk } : msg
                  ),
                };
              }
              return c;
            })
          );
        },
        (err) => {
          setConversations(prev =>
            prev.map(c => {
              if (c.id === activeConvId) {
                return {
                  ...c,
                  messages: c.messages.map(msg =>
                    msg.id === assistantMsgId
                      ? { ...msg, text: `⚠️ Stream Error: ${err.message || 'Connection lost'}`, isError: true }
                      : msg
                  ),
                };
              }
              return c;
            })
          );
        },
        () => {}
      );
    } finally {
      isSendingRef.current = false;
      setIsStreaming(false);
    }
  };

  // Retry generating last message with request locking
  const handleRetryMessage = async () => {
    if (isStreaming || isSendingRef.current || messages.length < 2) return;

    // Find last user message
    const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIndex === -1) return;

    isSendingRef.current = true;
    setIsStreaming(true);

    try {
      const actualUserIndex = messages.length - 1 - lastUserIndex;
      const lastUserMsg = messages[actualUserIndex];

      // Truncate messages up to the user message
      const newMessages = messages.slice(0, actualUserIndex + 1);

      const assistantMsgId = `ast-${Date.now()}`;
      const initialAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations(prev =>
        prev.map(c => {
          if (c.id === activeConvId) {
            return {
              ...c,
              messages: [...newMessages, initialAssistantMsg],
            };
          }
          return c;
        })
      );

      const historyForAi = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.text }));

      await aiService.chatStream(
        lastUserMsg.text,
        historyForAi,
        { equipment: equipmentList },
        (chunk) => {
          setConversations(prev =>
            prev.map(c => {
              if (c.id === activeConvId) {
                return {
                  ...c,
                  messages: c.messages.map(msg =>
                    msg.id === assistantMsgId ? { ...msg, text: msg.text + chunk } : msg
                  ),
                };
              }
              return c;
            })
          );
        },
        (err) => {
          setConversations(prev =>
            prev.map(c => {
              if (c.id === activeConvId) {
                return {
                  ...c,
                  messages: c.messages.map(msg =>
                    msg.id === assistantMsgId
                      ? { ...msg, text: `⚠️ Stream Error: ${err.message || 'Connection lost'}`, isError: true }
                      : msg
                  ),
                };
              }
              return c;
            })
          );
        },
        () => {}
      );
    } finally {
      isSendingRef.current = false;
      setIsStreaming(false);
    }
  };

  // Helper to parse embedded JSON chart from response if present
  const renderChartIfPresent = (text: string) => {
    try {
      const match = text.match(/```json\s*(\{[\s\S]*?"chart"[\s\S]*?\})\s*```/);
      if (match && match[1]) {
        const chartData = JSON.parse(match[1]);
        if (chartData.chart && Array.isArray(chartData.data)) {
          return (
            <div className="my-4 p-4 bg-black/40 rounded-xl border border-[var(--border-glass)] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--accent-cyan)]">
                <span className="flex items-center gap-1.5"><BarChart2 size={14} /> {chartData.title || 'Telemetry Data Visualization'}</span>
              </div>
              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartData.chart === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={chartData.data}
                        dataKey={chartData.dataKey || 'value'}
                        nameKey={chartData.nameKey || 'name'}
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        label
                      >
                        {chartData.data.map((_: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  ) : chartData.chart === 'area' ? (
                    <AreaChart data={chartData.data}>
                      <XAxis dataKey={chartData.xKey || 'name'} stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey={chartData.yKey || 'value'} stroke="#00f2fe" fill="#00f2fe22" />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData.data}>
                      <XAxis dataKey={chartData.xKey || 'name'} stroke="#888" fontSize={10} />
                      <YAxis stroke="#888" fontSize={10} />
                      <RechartsTooltip />
                      <Bar dataKey={chartData.yKey || 'value'} fill="#00f2fe" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          );
        }
      }
    } catch (e) {
      // Silent fail if JSON parsing doesn't match chart format
    }
    return null;
  };

  return (
    <div className="flex h-full min-h-[520px] rounded-3xl border border-[var(--border-glass)] bg-[var(--card-bg)]/80 backdrop-blur-md overflow-hidden relative">
      {/* Sidebar - Saved Conversations History */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-[var(--border-glass)] bg-black/40 flex flex-col justify-between overflow-hidden shrink-0 z-20"
          >
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white font-['Clash_Display'] flex items-center gap-2">
                  <Clock size={14} className="text-[var(--accent-cyan)]" /> History Threads
                </span>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-[var(--text-secondary)] hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <PanelLeftClose size={16} />
                </button>
              </div>

              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent-cyan)] text-[var(--bg-navy)] rounded-xl font-bold text-xs hover:shadow-[0_0_12px_var(--accent-cyan)] transition-all cursor-pointer"
              >
                <Plus size={15} /> New Conversation
              </button>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                      activeConvId === conv.id
                        ? 'bg-[var(--accent-cyan)]/15 border border-[var(--accent-cyan)]/40 text-white font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare size={13} className={activeConvId === conv.id ? 'text-[var(--accent-cyan)]' : ''} />
                      <span className="truncate max-w-[150px]">{conv.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 rounded transition-opacity"
                      title="Delete thread"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-[var(--border-glass)] text-[10px] text-[var(--text-secondary)] flex justify-between items-center">
              <span>{conversations.length} Local Session(s)</span>
              <button
                onClick={handleClearChat}
                className="text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Clear Messages
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Display */}
      <div className="flex-1 flex flex-col justify-between h-full relative overflow-hidden">
        {/* Top Chat Bar Header */}
        <div className="px-5 py-3 border-b border-[var(--border-glass)] bg-black/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(prev => !prev)}
              className="text-[var(--text-secondary)] hover:text-white p-1.5 rounded-xl border border-[var(--border-glass)] hover:border-[var(--accent-cyan)] transition-all cursor-pointer"
              title={showSidebar ? 'Hide history' : 'Show chat history'}
            >
              {showSidebar ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)]/40 flex items-center justify-center text-[var(--accent-cyan)]">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-['Clash_Display'] flex items-center gap-2">
                {activeConv?.title || 'MedGuard Gemini AI Assistant'}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Google Gemini API Streaming Mode • Context: {equipmentList.length} Medical Devices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRetryMessage}
              disabled={isStreaming || messages.length < 2}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-white rounded-xl text-[11px] font-semibold border border-[var(--border-glass)] transition-all cursor-pointer disabled:opacity-40"
              title="Regenerate last response"
            >
              <RotateCcw size={12} /> Retry
            </button>
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl text-[11px] font-semibold border border-red-500/30 transition-all cursor-pointer"
              title="Clear current session messages"
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>
        </div>

        {/* Message Stream Scroll Window */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px]">
          {messages.map((msg, index) => {
            const isLastAssistant = msg.role === 'assistant' && index === messages.length - 1;
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-cyan)]/20 border border-[var(--accent-cyan)]/40 flex items-center justify-center text-[var(--accent-cyan)] shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--accent-cyan)] text-[var(--bg-navy)] font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                      : 'bg-black/30 border border-[var(--border-glass)] text-[var(--text-primary)] rounded-tl-none'
                  }`}
                >
                  {/* Message Top Bar */}
                  <div className="flex justify-between items-center gap-4 mb-2 border-b border-white/10 pb-1 text-[10px] opacity-75">
                    <span className="font-bold flex items-center gap-1">
                      {msg.role === 'user' ? (
                        <>You</>
                      ) : (
                        <>
                          <Sparkles size={11} className="text-[var(--accent-cyan)]" /> MedGuard Gemini AI
                        </>
                      )}
                    </span>
                    <span className="font-mono text-[9px]">{msg.timestamp}</span>
                  </div>

                  {/* Message Body with Markdown */}
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap font-sans text-xs">{msg.text}</div>
                  ) : (
                    <div>
                      {msg.text ? (
                        <div className="markdown-body text-xs leading-relaxed space-y-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const codeString = String(children).replace(/\n$/, '');
                                const codeId = `code-${Math.random()}`;
                                if (inline) {
                                  return (
                                    <code className="bg-black/50 text-[var(--accent-cyan)] px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <div className="my-3 rounded-xl border border-[var(--border-glass)] bg-black/60 overflow-hidden font-mono text-[11px]">
                                    <div className="px-3 py-1.5 bg-white/5 border-b border-white/10 flex justify-between items-center text-[10px] text-[var(--text-secondary)]">
                                      <span>Code Output</span>
                                      <button
                                        onClick={() => handleCopyCode(codeString, codeId)}
                                        className="hover:text-white flex items-center gap-1 cursor-pointer"
                                      >
                                        {copiedCodeId === codeId ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                        {copiedCodeId === codeId ? 'Copied' : 'Copy'}
                                      </button>
                                    </div>
                                    <pre className="p-3 overflow-x-auto text-emerald-300">
                                      <code>{children}</code>
                                    </pre>
                                  </div>
                                );
                              },
                              table({ children }) {
                                return (
                                  <div className="my-3 overflow-x-auto rounded-xl border border-[var(--border-glass)] bg-black/30">
                                    <table className="w-full text-left text-xs divide-y divide-[var(--border-glass)]">
                                      {children}
                                    </table>
                                  </div>
                                );
                              },
                              thead({ children }) {
                                return <thead className="bg-white/5 text-[var(--accent-cyan)] font-bold">{children}</thead>;
                              },
                              tbody({ children }) {
                                return <tbody className="divide-y divide-white/5">{children}</tbody>;
                              },
                              th({ children }) {
                                return <th className="px-3 py-2 text-[11px]">{children}</th>;
                              },
                              td({ children }) {
                                return <td className="px-3 py-2 text-[11px] text-[var(--text-secondary)]">{children}</td>;
                              },
                              h1({ children }) {
                                return <h1 className="text-base font-bold text-white font-['Clash_Display'] mt-2 mb-1">{children}</h1>;
                              },
                              h2({ children }) {
                                return <h2 className="text-sm font-bold text-white font-['Clash_Display'] mt-2 mb-1">{children}</h2>;
                              },
                              h3({ children }) {
                                return <h3 className="text-xs font-bold text-[var(--accent-cyan)] mt-2 mb-1">{children}</h3>;
                              },
                              ul({ children }) {
                                return <ul className="list-disc list-inside space-y-1 my-1">{children}</ul>;
                              },
                              ol({ children }) {
                                return <ol className="list-decimal list-inside space-y-1 my-1">{children}</ol>;
                              },
                              blockquote({ children }) {
                                return <blockquote className="border-l-2 border-[var(--accent-cyan)] pl-3 italic text-[var(--text-secondary)] my-2">{children}</blockquote>;
                              }
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : isStreaming && isLastAssistant ? (
                        <div className="flex items-center gap-2 text-[var(--accent-cyan)] text-xs italic py-2">
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Generating streaming response from Gemini API...</span>
                        </div>
                      ) : null}

                      {/* Render Embedded Charts if JSON detected */}
                      {renderChartIfPresent(msg.text)}

                      {/* Streaming Typing Cursor Indicator */}
                      {isStreaming && isLastAssistant && (
                        <span className="inline-block w-2 h-3 bg-[var(--accent-cyan)] ml-1 animate-pulse rounded-sm align-middle" />
                      )}
                    </div>
                  )}

                  {/* Message Copy Hover Action */}
                  {msg.role === 'assistant' && msg.text && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="p-1 bg-black/60 hover:bg-black text-[var(--text-secondary)] hover:text-white rounded-md border border-[var(--border-glass)] cursor-pointer text-[10px] flex items-center gap-1"
                        title="Copy message text"
                      >
                        {copiedMsgId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedMsgId === msg.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area & Suggested Prompts */}
        <div className="p-4 border-t border-[var(--border-glass)] bg-black/20 space-y-3">
          {/* Suggested Prompts */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_PROMPTS.map(sp => (
              <button
                key={sp.label}
                onClick={() => handleSendMessage(sp.prompt)}
                disabled={isStreaming}
                className="whitespace-nowrap glass px-3 py-1.5 rounded-full text-[11px] text-[var(--text-secondary)] border border-[var(--border-glass)] hover:border-[var(--accent-cyan)] hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronRight size={12} className="text-[var(--accent-cyan)]" />
                {sp.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="glass p-1.5 rounded-2xl flex items-center border border-[var(--border-glass)] focus-within:border-[var(--accent-cyan)] transition-colors">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isStreaming}
              className="flex-1 bg-transparent px-4 py-2 text-xs text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]"
              placeholder="Ask MedGuard Gemini AI about equipment compliance, risk scores, maintenance schedules..."
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isStreaming || !chatInput.trim()}
              className="bg-[var(--accent-cyan)] text-[var(--bg-navy)] px-4 py-2 rounded-xl font-bold text-xs hover:shadow-[0_0_15px_var(--accent-cyan)] transition-all cursor-pointer disabled:opacity-40 disabled:hover:shadow-none flex items-center gap-1.5"
            >
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
