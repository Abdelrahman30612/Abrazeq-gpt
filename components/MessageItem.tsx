import React from 'react';
import { Message } from '../types';
import { MarkdownView } from './MarkdownView';
import { User, Bot, Globe, ExternalLink, Sparkles } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-start' : 'justify-start'} animate-fadeIn group`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 ${
          isUser 
            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white ring-2 ring-slate-900' 
            : 'bg-slate-800 border border-slate-700 text-purple-400'
        }`}>
          {isUser ? <User size={22} /> : <Bot size={22} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative px-5 py-4 rounded-2xl shadow-lg border text-right w-full overflow-hidden ${
            isUser 
              ? 'bg-gradient-to-r from-purple-900/80 to-slate-900 border-purple-500/30 rounded-tr-none text-white backdrop-blur-sm' 
              : 'bg-slate-900/80 border-slate-800 rounded-tl-none text-slate-200 backdrop-blur-sm'
          }`}>
            {/* Subtle glow effect for user messages */}
            {isUser && <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none" />}
            
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed relative z-10">{message.content}</p>
            ) : (
              <MarkdownView content={message.content} />
            )}
          </div>

          {/* Grounding / Sources Section */}
          {!isUser && message.groundingMetadata?.groundingChunks && message.groundingMetadata.groundingChunks.length > 0 && (
            <div className="mt-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg text-xs w-full max-w-2xl">
              <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold">
                <Globe size={14} />
                <span>المصادر المستخدمة:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.groundingMetadata.groundingChunks.map((chunk, idx) => {
                  if (chunk.web?.uri) {
                    return (
                      <a 
                        key={idx}
                        href={chunk.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 hover:text-purple-300 border border-slate-700 px-3 py-1.5 rounded-full transition-all text-slate-400 truncate max-w-[240px]"
                        title={chunk.web.title}
                      >
                        <span className="truncate">{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                        <ExternalLink size={10} />
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <span className="text-[10px] text-slate-500 mt-2 px-1 font-mono">
            {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};