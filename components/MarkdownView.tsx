import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-right leading-relaxed rtl-content prose-headings:text-purple-300 prose-a:text-pink-400 prose-strong:text-white prose-code:text-pink-300">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Override code block styling
          code({node, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');
            
            return isInline ? (
              <code className="bg-slate-800 text-pink-300 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700" {...props}>
                {children}
              </code>
            ) : (
              <div className="relative my-4 group" dir="ltr"> 
                <div className="absolute top-0 right-0 bg-slate-800 text-xs text-slate-400 px-2 py-1 rounded-bl border-l border-b border-slate-700">
                   {match ? match[1] : 'code'}
                </div>
                <pre className="bg-[#0d1117] text-slate-300 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-slate-800 shadow-xl">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          // Ensure lists have proper spacing in Arabic context
          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1 marker:text-purple-500" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1 marker:text-purple-500" {...props} />,
          a: ({node, ...props}) => <a className="text-pink-400 hover:text-pink-300 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-slate-200" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-purple-500 pr-4 italic bg-slate-900/50 py-2 rounded-l" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};