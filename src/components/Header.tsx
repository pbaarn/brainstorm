import React, { useRef } from 'react';
import { GistSyncConfig } from '../types';
import { GitHubIcon } from './GitHubIcon';
import {
  Lightbulb,
  Download,
  Upload,
  Plus,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  gistConfig: GistSyncConfig;
  onOpenGistModal: () => void;
  onOpenImportModal: () => void;
  onOpenNewSubjectModal: () => void;
  onBackupWorkspace: () => void;
  onRestoreWorkspace: (file: File) => void;
  onNavigateHome: () => void;
  currentSubjectTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  gistConfig,
  onOpenGistModal,
  onOpenImportModal,
  onOpenNewSubjectModal,
  onBackupWorkspace,
  onRestoreWorkspace,
  onNavigateHome,
  currentSubjectTitle,
}) => {
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestoreWorkspace(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                Brainstorm Manager
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Local-First
              </span>
            </div>
            {currentSubjectTitle && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[320px] block">
                {currentSubjectTitle}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gist Sync Status Button */}
          <button
            type="button"
            onClick={onOpenGistModal}
            title={
              gistConfig.enabled
                ? `Synced to Gist (${gistConfig.gistId.slice(0, 7)}...)`
                : 'Connect GitHub Gist for cloud sync'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              gistConfig.enabled
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-800 dark:border-slate-200 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {gistConfig.enabled ? 'Gist Sync' : 'Gist Backup'}
            </span>
            {gistConfig.enabled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
            )}
          </button>

          {/* Backup / Restore Menu */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={onBackupWorkspace}
              title="Download full workspace backup (.json)"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => restoreInputRef.current?.click()}
              title="Restore workspace from backup file"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              ref={restoreInputRef}
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </div>

          {/* Import AI Subject Button */}
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200 dark:border-violet-800/80 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Import AI Subject</span>
          </button>

          {/* New Subject Button */}
          <button
            type="button"
            onClick={onOpenNewSubjectModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xs hover:shadow-indigo-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Subject</span>
          </button>
        </div>
      </div>
    </header>
  );
};
