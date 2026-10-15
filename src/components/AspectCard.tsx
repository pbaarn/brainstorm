import React, { useState, useRef, useEffect } from 'react';
import { Aspect, AspectStatus } from '../types';
import { CheckCircle2, Clock, Circle, FileText, Trash2, Edit3, MessageSquareText } from 'lucide-react';

interface AspectCardProps {
  aspect: Aspect;
  categoryId: string;
  categoryName: string;
  onUpdate: (categoryId: string, updated: Aspect) => void;
  onDelete: (categoryId: string, aspectId: string) => void;
  onOpenNotes: (aspect: Aspect, categoryName: string) => void;
}

export const AspectCard: React.FC<AspectCardProps> = ({
  aspect,
  categoryId,
  categoryName,
  onUpdate,
  onDelete,
  onOpenNotes,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(aspect.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(aspect.title);
  }, [aspect.title]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    let nextStatus: AspectStatus = 'in_progress';
    if (aspect.status === 'not_started') nextStatus = 'in_progress';
    else if (aspect.status === 'in_progress') nextStatus = 'done';
    else if (aspect.status === 'done') nextStatus = 'not_started';

    onUpdate(categoryId, {
      ...aspect,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const saveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== aspect.title) {
      onUpdate(categoryId, {
        ...aspect,
        title: trimmed,
        updatedAt: new Date().toISOString(),
      });
    } else {
      setTitleInput(aspect.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setTitleInput(aspect.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div
      onClick={() => onOpenNotes(aspect, categoryName)}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
        aspect.status === 'done'
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50 hover:border-emerald-300'
          : aspect.status === 'in_progress'
          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50 hover:border-amber-300'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
      }`}
    >
      {/* Top Bar: Category Pill & Status Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Category Badge on Card */}
        <span
          title={categoryName}
          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 truncate max-w-[180px]"
        >
          {categoryName}
        </span>

        {/* 1-Click Status Button */}
        <button
          type="button"
          onClick={cycleStatus}
          title={`Status: ${aspect.status.replace('_', ' ')} (Click to toggle)`}
          className="shrink-0 focus:outline-hidden transition-transform active:scale-90"
        >
          {aspect.status === 'done' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Done</span>
            </span>
          ) : aspect.status === 'in_progress' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
              <span>In Progress</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <Circle className="w-3.5 h-3.5 text-slate-400" />
              <span>Pending</span>
            </span>
          )}
        </button>
      </div>

      {/* Main Body: Title & Notes Snippet */}
      <div className="space-y-2 flex-1 min-h-[48px]">
        {isEditingTitle ? (
          <div onClick={(e) => e.stopPropagation()}>
            <input
              ref={titleInputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleKeyDown}
              className="w-full text-sm font-medium px-2 py-1 rounded-md border border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden ring-2 ring-indigo-400/20"
            />
          </div>
        ) : (
          <h4
            className={`text-sm font-semibold leading-snug ${
              aspect.status === 'done'
                ? 'text-slate-600 dark:text-slate-400 line-through decoration-emerald-500/60'
                : aspect.status === 'in_progress'
                ? 'text-amber-950 dark:text-amber-100'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {aspect.title}
          </h4>
        )}

        {aspect.notes && (
          <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/50 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
            <MessageSquareText className="w-3.5 h-3.5 shrink-0 text-indigo-500 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">{aspect.notes}</p>
          </div>
        )}
      </div>

      {/* Bottom Footer: Action Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400"
      >
        <button
          type="button"
          onClick={() => onOpenNotes(aspect, categoryName)}
          className="inline-flex items-center gap-1 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{aspect.notes ? 'View Notes' : 'Add Notes'}</span>
        </button>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            title="Edit title"
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(categoryId, aspect.id)}
            title="Delete aspect"
            className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
