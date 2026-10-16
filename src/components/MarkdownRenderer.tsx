import React from 'react';
import { ExternalLink, CheckSquare, Square } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content.trim()) {
    return (
      <div className="text-slate-400 italic text-sm py-4">
        Geen notities ingevoerd. Schrijf notities in markdown (bijv. lijstjes, links, headers).
      </div>
    );
  }

  // Helper to parse inline markdown (bold, italic, inline code, links)
  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matching: links [text](url), inline code `code`, bold **text**, italic *text*
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // 1. Link: [label](url)
      const linkMatch = remaining.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        tokens.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 font-medium underline inline-flex items-center gap-0.5 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // 2. Bold: **text**
      const boldMatch = remaining.match(/^\*\*(.*?)\*\*/);
      if (boldMatch) {
        tokens.push(
          <strong key={key++} className="font-bold text-slate-900 dark:text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // 3. Italic: *text* or _text_
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        tokens.push(
          <em key={key++} className="italic text-slate-800 dark:text-slate-200">
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // 4. Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        tokens.push(
          <code
            key={key++}
            className="px-1.5 py-0.5 font-mono text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-slate-200 dark:border-slate-700"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Plain character / word segment until next potential markdown character
      const nextSpecial = remaining.search(/(\[|\*\*|\*|_|`)/);
      if (nextSpecial === -1) {
        tokens.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Unmatched markdown symbol, treat as plain text
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        tokens.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return tokens;
  };

  // Block level parsing
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let index = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={index++} className="h-2" />);
      continue;
    }

    // Code blocks ```
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre
          key={index++}
          className="p-3 my-2 text-xs font-mono rounded-xl bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-200 overflow-x-auto border border-slate-800"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Headers
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={index++} className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {renderInline(trimmed.replace('# ', ''))}
        </h1>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index++} className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1.5">
          {renderInline(trimmed.replace('## ', ''))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index++} className="text-base font-semibold text-slate-900 dark:text-white mt-2.5 mb-1">
          {renderInline(trimmed.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote
          key={index++}
          className="pl-3.5 my-2 border-l-3 border-indigo-500 text-slate-600 dark:text-slate-300 italic text-sm bg-indigo-50/40 dark:bg-indigo-950/20 py-1 rounded-r-lg"
        >
          {renderInline(trimmed.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Checklists: - [ ] or - [x]
    const checklistMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.*)/);
    if (checklistMatch) {
      const checked = checklistMatch[1].toLowerCase() === 'x';
      elements.push(
        <div key={index++} className="flex items-start gap-2 text-sm my-1 leading-relaxed">
          {checked ? (
            <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          )}
          <span className={checked ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
            {renderInline(checklistMatch[2])}
          </span>
        </div>
      );
      continue;
    }

    // Bullet lists: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={index++} className="flex items-start gap-2 text-sm my-1 leading-relaxed pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
          <span className="text-slate-800 dark:text-slate-200">
            {renderInline(trimmed.replace(/^[-*]\s+/, ''))}
          </span>
        </div>
      );
      continue;
    }

    // Numbered lists: 1. 2.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={index++} className="flex items-start gap-2 text-sm my-1 leading-relaxed pl-1">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 w-4 shrink-0 mt-0.5">
            {numberedMatch[1]}.
          </span>
          <span className="text-slate-800 dark:text-slate-200">
            {renderInline(numberedMatch[2])}
          </span>
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={index++} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    );
  }

  return <div className={`space-y-0.5 ${className}`}>{elements}</div>;
};
