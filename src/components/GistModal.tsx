import React, { useState } from 'react';
import { GistSyncConfig, Subject } from '../types';
import {
  verifyGitHubToken,
  createGistFromSubjects,
  pushToGist,
  pullFromGist,
  saveGistConfig,
} from '../services/gist';
import { GitHubIcon } from './GitHubIcon';
import {
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Key,
  RefreshCw,
} from 'lucide-react';

interface GistModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GistSyncConfig;
  onConfigChange: (newConfig: GistSyncConfig) => void;
  subjects: Subject[];
  onSubjectsUpdatedFromGist: (subjects: Subject[]) => void;
}

export const GistModal: React.FC<GistModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigChange,
  subjects,
  onSubjectsUpdatedFromGist,
}) => {
  const [token, setToken] = useState(config.token || '');
  const [gistId, setGistId] = useState(config.gistId || '');
  const [autoSync, setAutoSync] = useState(config.autoSync || false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!token.trim()) {
      setMessage({ type: 'error', text: 'Please enter a GitHub Personal Access Token.' });
      return;
    }
    setIsVerifying(true);
    setMessage(null);
    const res = await verifyGitHubToken(token);
    setIsVerifying(false);
    if (res.valid) {
      setMessage({
        type: 'success',
        text: `Successfully verified as @${res.username}!`,
      });
      const newConfig: GistSyncConfig = {
        ...config,
        token: token.trim(),
        enabled: true,
      };
      onConfigChange(newConfig);
      saveGistConfig(newConfig);
    } else {
      setMessage({
        type: 'error',
        text: res.error || 'Invalid token. Please check permissions.',
      });
    }
  };

  const handleCreateNewGist = async () => {
    if (!token.trim()) {
      setMessage({ type: 'error', text: 'Please enter and verify your token first.' });
      return;
    }
    setIsSyncing(true);
    setMessage({ type: 'info', text: 'Creating private Gist on your GitHub account...' });

    const res = await createGistFromSubjects(token, subjects);
    setIsSyncing(false);

    if (res.success && res.gistId) {
      setGistId(res.gistId);
      const newConfig: GistSyncConfig = {
        enabled: true,
        token: token.trim(),
        gistId: res.gistId,
        autoSync,
        lastSyncedAt: new Date().toISOString(),
      };
      onConfigChange(newConfig);
      saveGistConfig(newConfig);
      setMessage({
        type: 'success',
        text: `Private Gist created successfully! ID: ${res.gistId}`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to create Gist.' });
    }
  };

  const handlePushNow = async () => {
    if (!token.trim() || !gistId.trim()) {
      setMessage({ type: 'error', text: 'Token and Gist ID are required to push.' });
      return;
    }
    setIsSyncing(true);
    setMessage({ type: 'info', text: 'Uploading workspace to Gist...' });
    const res = await pushToGist(token, gistId, subjects);
    setIsSyncing(false);
    if (res.success) {
      const newConfig: GistSyncConfig = {
        ...config,
        token: token.trim(),
        gistId: gistId.trim(),
        autoSync,
        lastSyncedAt: new Date().toISOString(),
      };
      onConfigChange(newConfig);
      saveGistConfig(newConfig);
      setMessage({
        type: 'success',
        text: `Workspace pushed to Gist at ${new Date().toLocaleTimeString()}!`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to push to Gist.' });
    }
  };

  const handlePullNow = async () => {
    if (!token.trim() || !gistId.trim()) {
      setMessage({ type: 'error', text: 'Token and Gist ID are required to pull.' });
      return;
    }
    if (!window.confirm('Pulling from Gist will replace current local workspace. Proceed?')) {
      return;
    }
    setIsSyncing(true);
    setMessage({ type: 'info', text: 'Fetching workspace from Gist...' });
    const res = await pullFromGist(token, gistId);
    setIsSyncing(false);
    if (res.success && res.subjects) {
      onSubjectsUpdatedFromGist(res.subjects);
      const newConfig: GistSyncConfig = {
        ...config,
        token: token.trim(),
        gistId: gistId.trim(),
        autoSync,
        lastSyncedAt: new Date().toISOString(),
      };
      onConfigChange(newConfig);
      saveGistConfig(newConfig);
      setMessage({
        type: 'success',
        text: `Successfully loaded ${res.subjects.length} subjects from Gist!`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to pull from Gist.' });
    }
  };

  const handleSaveSettings = () => {
    const newConfig: GistSyncConfig = {
      enabled: Boolean(token.trim() && gistId.trim()),
      token: token.trim(),
      gistId: gistId.trim(),
      autoSync,
      lastSyncedAt: config.lastSyncedAt,
    };
    onConfigChange(newConfig);
    saveGistConfig(newConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <GitHubIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                GitHub Gist Cloud Persistence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync your brainstorms across devices securely with a private Gist
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Instructions Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-500" />
              How it works:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>
                Create a GitHub Personal Access Token with the{' '}
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">gist</span> scope.
              </li>
              <li>Paste your token below to automatically create or link a private Gist.</li>
              <li>Your token is kept strictly inside your browser local storage.</li>
            </ol>
            <a
              href="https://github.com/settings/tokens/new?scopes=gist&description=Brainstorm+Manager+Sync"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              Generate token with Gist scope on GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Token Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Personal Access Token (classic or fine-grained)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="flex-1 px-3.5 py-2 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || !token.trim()}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-50 transition-colors"
              >
                {isVerifying ? 'Checking...' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Gist ID */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Gist ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
                placeholder="e.g. 7f8e9a0b1c2d3e4f5..."
                className="flex-1 px-3.5 py-2 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleCreateNewGist}
                disabled={isSyncing || !token.trim()}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shrink-0"
              >
                Create New Gist
              </button>
            </div>
            {gistId && (
              <p className="text-[11px] text-slate-400 mt-1">
                Linked to:{' '}
                <a
                  href={`https://gist.github.com/${gistId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline inline-flex items-center gap-0.5"
                >
                  gist.github.com/{gistId}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            )}
          </div>

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Automatic Sync
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically push changes to your Gist when editing
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
            />
          </div>

          {/* Sync Actions Bar */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handlePushNow}
              disabled={isSyncing || !token.trim() || !gistId.trim()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 text-indigo-500" />
              <span>Push to Gist</span>
            </button>

            <button
              type="button"
              onClick={handlePullNow}
              disabled={isSyncing || !token.trim() || !gistId.trim()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              <span>Pull from Gist</span>
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-xs ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : message.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <span className="text-[11px] text-slate-400">
            {config.lastSyncedAt
              ? `Last synced: ${new Date(config.lastSyncedAt).toLocaleString()}`
              : 'Not synced yet'}
          </span>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs hover:shadow-md transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
