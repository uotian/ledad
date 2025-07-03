import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  children: string;
}

export default function Markdown({ children }: MarkdownProps) {
  return (
    <div className="prose prose-sm prose-gray max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 見出しのスタイル
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-white mb-4 mt-6 border-b border-gray-600 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-white mb-3 mt-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-white mb-2 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium text-white mb-2 mt-3">
              {children}
            </h4>
          ),
          // 段落のスタイル
          p: ({ children }) => (
            <p className="text-gray-100 mb-4 leading-relaxed">{children}</p>
          ),
          // リストのスタイル
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-gray-100 mb-4 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-gray-100 mb-4 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-gray-100">{children}</li>,
          // コードブロックのスタイル
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-gray-800 text-gray-100 p-2 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-800 text-gray-100 p-2 rounded-lg text-sm font-mono overflow-x-auto">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-gray-800 rounded-lg p-2 mb-4 overflow-x-auto">
              {children}
            </pre>
          ),
          // リンクのスタイル
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-300 hover:text-blue-200 underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          // 強調のスタイル
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-100">{children}</em>
          ),
          // 引用のスタイル
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-white/10 pl-2 italic text-gray-200 mb-4">
              {children}
            </blockquote>
          ),
          // 水平線のスタイル
          hr: () => <hr className="border-white/10 my-6" />,
          // テーブルのスタイル
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-white/10 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-800">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-700">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-800">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-medium text-white border-b border-white/10">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-100">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
