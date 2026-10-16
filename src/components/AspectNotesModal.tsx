import React, { useState } from 'react';
import { Aspect } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  CircleDot,
  Eye,
  Edit3,
  Columns,
  HelpCircle,
} from 'lucide-react';

interface AspectNotesModalProps {
  aspect: Aspect;
  categoryName: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string, status: Aspect['status'], title: string) => void;
}

export const AspectNotesModal: React.FC<AspectNotesModalProps> = ({
  aspect,
  categoryName,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(aspect.title);
  const [notes, setNotes] = useState(aspect.notes || '');
  const [status, setStatus] = useState<Aspect['status']>(aspect.status);
  const [noteMode, setNoteMode] = useState<'write' | 'preview' | 'split'>('split');
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(notes, status, title);
    onClose();
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    setNotes((prev) => `${prev}\n${prefix}${suffix}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className={`relative w-full ${
          noteMode === 'split' ? 'max-w-4xl' : 'max-w-2xl'
        } bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 transition-all`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {categoryName}
            </span>
            <span className="text-xs text-slate-400">Aspect Details & Notes</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title Edit */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Aspect Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-base font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Memory profiling & cache eviction"
            />
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Brainstorm Status
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatus('not_started')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  status === 'not_started'
                    ? 'bg-slate-100 border-slate-400 text-slate-900 dark:bg-slate-800 dark:border-slate-500 dark:text-white ring-2 ring-slate-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <CircleDot className="w-4 h-4 text-slate-400" />
                <span>Not Started</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('in_progress')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  status === 'in_progress'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-200 ring-2 ring-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('done')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  status === 'done'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-600 dark:text-emerald-200 ring-2 ring-emerald-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Done</span>
              </button>
            </div>
          </div>

          {/* Markdown Notes Area with Live Preview */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Brainstorm Notities
              </label>

              {/* View Mode Switcher: Write / Preview / Split */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setNoteMode('write')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                      noteMode === 'write'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Bewerken</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoteMode('preview')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                      noteMode === 'preview'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNoteMode('split')}
                    className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                      noteMode === 'split'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Columns className="w-3 h-3" />
                    <span>Split View</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCheatSheet(!showCheatSheet)}
                  title="Markdown opmaakhulp"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Markdown Cheat Sheet Help */}
            {showCheatSheet && (
              <div className="mb-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200 flex flex-wrap gap-x-4 gap-y-1.5 animate-in fade-in">
                <span><strong>**vet**</strong> of <em>*cursief*</em></span>
                <span><code>`code`</code></span>
                <span><code># Kop</code> of <code>## Subkop</code></span>
                <span><code>- lijst item</code></span>
                <span><code>- [ ] checklist item</code></span>
                <span><code>[link titel](https://...)</code></span>
                <span><code>&gt; citaat / quote</code></span>
              </div>
            )}

            {/* Quick Markdown Formatting Toolbar */}
            {noteMode !== 'preview' && (
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => insertMarkdown('## ')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('**vetgedrukt**')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- ')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  • Lijst
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('- [ ] ')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  ☑ Checklist
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('[link titel](https://...)')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  🔗 Link
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('> ')}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 italic text-slate-700 dark:text-slate-300"
                >
                  " Citaat
                </button>
              </div>
            )}

            {/* Editor & Preview Panels */}
            {noteMode === 'split' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[260px]">
                {/* Editor on Left */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-400 mb-1">Markdown Invoer:</span>
                  <textarea
                    rows={12}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Typ hier je notities in markdown...&#10;&#10;## Kernbevindingen&#10;- Punt 1&#10;- [x] Voltooid item&#10;- [ ] Nog te doen&#10;&#10;[Handige link](https://...)"
                    className="flex-1 w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 leading-relaxed"
                  />
                </div>

                {/* Live Preview on Right */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-slate-400 mb-1">Live Opgemaakte Preview:</span>
                  <div className="flex-1 w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-y-auto max-h-[300px]">
                    <MarkdownRenderer content={notes} />
                  </div>
                </div>
              </div>
            ) : noteMode === 'preview' ? (
              <div className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[240px] max-h-[360px] overflow-y-auto shadow-2xs">
                <MarkdownRenderer content={notes} />
              </div>
            ) : (
              <textarea
                rows={10}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Typ hier je notities in markdown...&#10;&#10;## Kernbevindingen&#10;- Punt 1&#10;- [x] Voltooid item&#10;- [ ] Nog te doen&#10;&#10;[Handige link](https://...)"
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs hover:shadow-md transition-all"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
};
