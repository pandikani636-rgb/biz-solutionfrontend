import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Minus,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const AIChatbotWidget = () => {
  const { language, isTamil } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: isTamil
        ? 'வணக்கம்! நான் பாலுமுனி அண்ட் அசோசியேட்ஸ் (BizZolution) AI உதவியாளர். இண்டஸ்ட்ரியல் பேரிங்ஸ், பெல்ட்கள், மொத்த விலை தள்ளுபடிகள் மற்றும் ஆர்டர் தகவல்களை என்னிடம் கேட்கலாம்.'
        : 'Hello! Welcome to Balumuni & Associates (BizZolution). How can I assist you with industrial bearings, belts, wholesale pricing, or bulk RFQs today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    isTamil ? 'மொத்த தள்ளுபடி விபரம்' : 'Wholesale Discounts',
    isTamil ? 'பிராண்டுகள் & பாகங்கள்' : 'Available Makes',
    isTamil ? 'ஆர்டர் செய்யும் முறை' : 'How to Order RFQ',
    isTamil ? 'தொடர்பு விபரம்' : 'Contact Srivilliputtur',
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chatbot/query', {
        query: text.trim(),
        language,
      });

      if (res.data?.success) {
        const botMsg = {
          sender: 'bot',
          text: res.data.reply,
          quickLink: res.data.quickLink,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (res.data.suggestions && res.data.suggestions.length > 0) {
          setSuggestions(res.data.suggestions);
        }
      } else {
        throw new Error('Service error');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: isTamil
            ? 'மன்னிக்கவும், தகவல் பெறுவதில் சிறிய பிழை ஏற்பட்டது. தயவுசெய்து எங்களை 7418423238 என்ற எண்ணில் அழைக்கவும்.'
            : 'Sorry, I encountered a temporary connection issue. You can call our technical desk directly at +91 7418423238 / 9842670320.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: isTamil
          ? 'உரையாடல் அழிக்கப்பட்டது. உங்கள் புதிய கேள்வியை கேட்கலாம்!'
          : 'Chat history cleared. How else can I assist you?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none print:hidden font-sans">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-navy via-navy-light to-navy text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-accent/40"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-accent group-hover:rotate-12 transition-smooth" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-navy animate-pulse" />
          </div>
          <span className="text-xs font-black tracking-tight text-white pr-1">
            {isTamil ? 'AI உதவியாளர்' : 'BizZolution AI'}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`w-[92vw] sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[540px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-navy text-white p-3.5 px-4 flex justify-between items-center border-b border-navy-light/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-accent shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs leading-none flex items-center gap-1.5">
                  <span>Balumuni & BizZolution AI</span>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-semibold px-1.5 py-0.2 rounded">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  {isTamil ? 'உடனடி தொழில்நுட்ப வழிகாட்டி' : 'Engineering Catalog & RFQ Guide'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClearChat}
                className="p-1 hover:text-white rounded-lg hover:bg-white/10"
                title="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white rounded-lg hover:bg-white/10"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded-lg hover:bg-white/10"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (if not minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 items-start ${
                      m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        m.sender === 'user'
                          ? 'bg-navy text-accent'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl p-3 shadow-xs leading-relaxed whitespace-pre-wrap ${
                        m.sender === 'user'
                          ? 'bg-navy text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                      }`}
                    >
                      {m.text}

                      {m.quickLink && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80">
                          <Link
                            to={m.quickLink.url}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-black text-primary hover:underline"
                          >
                            <span>{m.quickLink.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips */}
              {suggestions.length > 0 && (
                <div className="p-2 px-3 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Ask:</span>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-lightBlue text-slate-700 hover:text-primary font-semibold whitespace-nowrap transition-smooth shrink-0 border border-slate-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={
                    isTamil ? 'கேள்வியை உள்ளிடவும்...' : 'Type your question...'
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 bg-navy text-accent rounded-xl hover:bg-primary hover:text-white disabled:opacity-40 transition-smooth"
                  title="Send"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
