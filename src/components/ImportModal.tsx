import React, { useState } from 'react';
import { Subject } from '../types';
import { parseSubjectImport, AI_PROMPT_TEMPLATE } from '../services/storage';
import { X, Upload, Copy, Check, FileCode, AlertCircle, Sparkles, Eye } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (subject: Subject) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<'paste' | 'file'>('paste');
  const [rawText, setRawText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Subject | null>(null);

  if (!isOpen) return null;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleTextChange = (text: string) => {
    setRawText(text);
    setError(null);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }

    const result = parseSubjectImport(text);
    if (result.success && result.subject) {
      setParsedPreview(result.subject);
      setError(null);
    } else {
      setParsedPreview(null);
      setError(result.error || 'Invalid format');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
      setActiveTab('paste'); // switch to show text and preview
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedPreview) {
      const result = parseSubjectImport(rawText);
      if (result.success && result.subject) {
        onImport(result.subject);
        onClose();
      } else {
        setError(result.error || 'Failed to parse subject');
      }
      return;
    }

    onImport(parsedPreview);
    onClose();
  };

  const totalAspects = parsedPreview
    ? parsedPreview.categories.reduce((acc, c) => acc + c.aspects.length, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Import Subject from AI or File
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import a decomposed subject with categories and aspects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Prompt helper banner */}
        <div className="px-6 py-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <span className="font-semibold">Need AI to decompose a subject?</span> Copy our pre-made prompt template and paste it into ChatGPT, Claude, or Gemini.
          </div>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-2xs shrink-0"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy AI Prompt'}</span>
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'paste'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Paste JSON or Markdown
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`pb-2.5 transition-colors border-b-2 ${
                activeTab === 'file'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Upload Local File (.json / .md)
            </button>
          </div>

          {activeTab === 'paste' ? (
            <div>
              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`Paste JSON or Markdown here...\n\nExample JSON:\n{\n  "title": "Quantum Computing",\n  "categories": [\n    {\n      "name": "Qubits & Hardware",\n      "aspects": ["Superconducting circuits", "Trapped ion coherence times"]\n    }\n  ]\n}`}
                className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/30">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
                Choose a local subject file
              </p>
              <p className="text-xs text-slate-400 mb-4">Accepts .json or .md files</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                <FileCode className="w-4 h-4" />
                <span>Select File</span>
                <input
                  type="file"
                  accept=".json,.md,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Validation / Parsing Error */}
          {error && rawText.trim() && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Preview Card */}
          {parsedPreview && (
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Subject Ready to Import:
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                  {parsedPreview.categories.length} Categories · {totalAspects} Aspects
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {parsedPreview.title}
              </p>
              {parsedPreview.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {parsedPreview.description}
                </p>
              )}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {parsedPreview.categories.map((c, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {c.name} ({c.aspects.length})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parsedPreview}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Import Subject</span>
          </button>
        </div>
      </div>
    </div>
  );
};
