import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Shield, Sparkles, ArrowRight, Bot, User, LifeBuoy } from 'lucide-react';
import { chatApi, ticketApi } from '../../services/api';

export default function LenseChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: "Hello! I'm **Lense**, your 24/7 security and privacy assistant. How can I help you protect your digital content today?",
      actions: [
        { label: 'Try Scam Analyzer', path: '/scan?mode=scam-analyzer' },
        { label: 'Check Leak Guard', path: '/scan?mode=leak-guard' }
      ],
      suggestions: [
        'How do I scan a scam message?',
        'What data does TrustLense store?',
        'How does redaction work?'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ email: '', subject: '', message: '' });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build brief chat history
      const history = messages.slice(-4).map((m) => ({
        sender: m.sender === 'user' ? 'User' : 'Lense',
        text: m.text
      }));

      const res = await chatApi.sendMessage({
        message: query,
        chatHistory: history
      });

      const botReply = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: res.data.reply,
        actions: res.data.actions || [],
        suggestions: res.data.suggestions || []
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "I'm having trouble connecting to the security engine right now. You can try our deterministic scanner directly on the Scan page.",
          actions: [{ label: 'Go to Scanner', path: '/scan' }]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.email || !ticketForm.subject || !ticketForm.message) return;
    setTicketSubmitting(true);

    try {
      await ticketApi.createTicket({
        email: ticketForm.email,
        subject: ticketForm.subject,
        message: ticketForm.message,
        chatTranscript: messages.map(m => ({ sender: m.sender, text: m.text }))
      });
      setTicketSuccess(true);
      setTimeout(() => {
        setShowTicketModal(false);
        setTicketSuccess(false);
        setTicketForm({ email: '', subject: '', message: '' });
      }, 2500);
    } catch (err) {
      alert('Failed to submit ticket: ' + err.message);
    } finally {
      setTicketSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-navy-900 text-white rounded-full shadow-2xl hover:bg-navy-800 transition-all transform hover:scale-105 border border-slate-700/80"
            aria-label="Open Lense AI Assistant"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent-blue flex items-center justify-center text-white">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-navy-900 animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold font-sans flex items-center gap-1.5">
                <span>Ask Lense</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono">24/7 AI</span>
              </div>
              <div className="text-[10px] text-slate-300">Security & Privacy Help</div>
            </div>
          </button>
        )}
      </div>

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-navy-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent-blue flex items-center justify-center text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-navy-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 font-sans">
                  <span>Lense</span>
                  <span className="text-[10px] font-mono font-medium text-primary-light bg-primary-dark/40 px-1.5 py-0.5 rounded">
                    AI ASSISTANT
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Online • Privacy Protected</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowTicketModal(true)}
                title="Talk to a human / Submit ticket"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <LifeBuoy className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="truncate">PII is scrubbed automatically before analysis.</span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white text-navy-900 border border-slate-200/80 shadow-sm rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  </div>

                  {/* Render interactive action buttons if provided */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act.path)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-primary bg-primary-50 hover:bg-primary-100 border border-primary-100 rounded-lg transition-colors"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Render followup suggestion chips if provided */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="text-[10px] text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs py-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span className="italic">Lense is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about scams, PII, risk score..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-navy-900 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-navy-900">Contact Security Support</h3>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-navy-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-navy-900">Ticket Submitted!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Our security team has received your transcript and will reach out shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
                    placeholder="Brief description of your issue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary"
                    placeholder="Provide details..."
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Note: Any sensitive numbers or credentials in your transcript will be automatically sanitized.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={ticketSubmitting}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
                  >
                    {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
