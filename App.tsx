import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles, RefreshCw, Code, Cpu } from 'lucide-react';
import { geminiService } from './services/geminiService';
import { Message } from './types';
import { MessageItem } from './components/MessageItem';
import BackgroundAnimation from './components/BackgroundAnimation';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'أهلاً بك في **Abrazeq GPT**. \n\nأنا نظام ذكاء اصطناعي متطور مصمم لمساعدتك في كتابة الأكواد، حل المشكلات المعقدة، والبحث في الويب. كيف يمكنني دعم مشروعك القادم؟',
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    setInputText('');
    
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
    }

    const newMessageId = Date.now().toString();
    const userMessage: Message = {
      id: newMessageId,
      role: 'user',
      content: userMessageText,
      timestamp: Date.now()
    };

    const modelMessageId = (Date.now() + 1).toString();
    const initialModelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      content: '', // Start empty for streaming
      isStreaming: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage, initialModelMessage]);
    setIsLoading(true);
    setError(null);

    try {
      await geminiService.sendMessageStream(
        userMessageText,
        (streamedText) => {
          setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId 
              ? { ...msg, content: streamedText }
              : msg
          ));
        },
        (fullText, groundingMetadata) => {
          setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId 
              ? { ...msg, content: fullText, isStreaming: false, groundingMetadata }
              : msg
          ));
          setIsLoading(false);
        },
        (err) => {
          setError("حدث خطأ في الاتصال بالنظام.");
          setMessages(prev => prev.map(msg => 
            msg.id === modelMessageId 
              ? { ...msg, content: msg.content + "\n\n`[System Error: Connection Terminated]`", isStreaming: false }
              : msg
          ));
          setIsLoading(false);
        }
      );
    } catch (e) {
      setIsLoading(false);
      setError("System Failure.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm('إعادة ضبط النظام؟ سيتم حذف جميع البيانات الحالية.')) {
      geminiService.startNewSession();
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        content: 'تمت إعادة تهيئة النظام. جاهز للأوامر الجديدة.',
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30 relative">
      
      {/* Background Ambience & Animation */}
      <BackgroundAnimation />
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="flex-none bg-slate-950/80 border-b border-slate-800 p-4 shadow-lg backdrop-blur-md z-20 sticky top-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-600/30 blur-md rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img 
                src="https://i.ibb.co/WW1HtHvG/image.png" 
                alt="Abrazeq Logo" 
                className="relative w-14 h-14 object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent tracking-tight">
                Abrazeq <span className="text-purple-500">GPT</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span>System Online v2.5</span>
              </div>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="group p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30"
            title="إعادة ضبط"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent relative z-10 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length - 1]?.role !== 'model' && (
             <div className="flex justify-start mb-8 animate-pulse">
                <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-5 py-3 rounded-2xl rounded-tr-none text-purple-400 text-sm font-mono shadow-lg backdrop-blur">
                   <Cpu size={16} className="animate-spin" />
                   جاري المعالجة...
                </div>
             </div>
          )}
          {error && (
            <div className="text-center text-red-400 text-sm my-4 bg-red-950/20 border border-red-900/50 p-3 rounded-lg backdrop-blur-sm mx-auto max-w-md">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-slate-950/90 border-t border-slate-800/60 p-4 backdrop-blur-xl z-20">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative flex items-end gap-3 bg-slate-900 border border-slate-700 rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50 transition-all shadow-2xl group">
            
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب استفسارك أو الكود هنا..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-[160px] min-h-[48px] py-3 px-3 text-slate-100 placeholder-slate-500 leading-relaxed font-sans"
              rows={1}
              disabled={isLoading}
              dir="rtl"
            />
            
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`flex-none p-3.5 rounded-xl transition-all duration-300 ${
                inputText.trim() && !isLoading
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:scale-105 active:scale-95' 
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
              ) : (
                <Send size={20} className={inputText.trim() ? 'ml-0.5' : ''} />
              )}
            </button>
          </div>
          
          <div className="text-center mt-3 flex items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <Sparkles size={10} className="text-purple-400" />
            <p className="text-[10px] text-slate-400 font-mono">
              Powered by Abrazeq • Grounded with Google Search
            </p>
            <Sparkles size={10} className="text-purple-400" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;