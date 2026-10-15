import React, { useState, useRef, useEffect } from 'react';
import { Aspect, AspectStatus } from '../types';
import { CheckCircle2, Clock, Circle, FileText, Trash2, Edit3, MessageSquareText } from 'lucide-react';

interface AspectItemProps {
  aspect: Aspect;
  categoryName: string;
  onUpdate: (updated: Aspect) => void;
  onDelete: (aspectId: string) => void;
  onOpenNotes: (aspect: Aspect) => void;
}

export const AspectItem: React.FC<AspectItemProps> = ({
  aspect,
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

    onUpdate({
      ...aspect,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const saveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== aspect.title) {
      onUpdate({
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
      className={`group relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${
        aspect.status === 'done'
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
          : aspect.status === 'in_progress'
          ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* 1-Click Status Button */}
      <button
        type="button"
        onClick={cycleStatus}
        title={`Status: ${aspect.status.replace('_', ' ')} (Click to toggle)`}
        className="mt-0.5 shrink-0 focus:outline-hidden transition-transform active:scale-90"
      >
        {aspect.status === 'done' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
        ) : aspect.status === 'in_progress' ? (
          <div className="relative">
            <Clock className="w-5 h-5 text-amber-500 fill-amber-100 dark:fill-amber-950" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
        ) : (
          <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500" />
        )}
      </button>

      {/* Title & Notes Info */}
      <div className="flex-1 min-w-0">
        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={handleKeyDown}
            className="w-full text-sm font-medium px-2 py-1 rounded-md border border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden ring-2 ring-indigo-400/20"
          />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span
                onClick={() => onOpenNotes(aspect)}
                className={`text-sm font-medium cursor-pointer transition-colors ${
                  aspect.status === 'done'
                    ? 'text-slate-600 dark:text-slate-400 line-through decoration-emerald-500/50'
                    : aspect.status === 'in_progress'
                    ? 'text-amber-950 dark:text-amber-200'
                    : 'text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {aspect.title}
              </span>

              {/* Status Badge */}
              {aspect.status === 'in_progress' && (
                <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  In Progress
                </span>
              )}
              {aspect.status === 'done' && (
                <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Done
                </span>
              )}
            </div>

            {/* Note Snippet Preview */}
            {aspect.notes && (
              <div
                onClick={() => onOpenNotes(aspect)}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer line-clamp-1 bg-slate-50/80 dark:bg-slate-950/40 px-2 py-1 rounded-md border border-slate-200/50 dark:border-slate-800/50"
              >
                <MessageSquareText className="w-3 h-3 shrink-0 text-indigo-500" />
                <span className="truncate">{aspect.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        {/* Open Notes Button */}
        <button
          type="button"
          onClick={() => onOpenNotes(aspect)}
          title={aspect.notes ? 'View/edit notes' : 'Add brainstorm notes'}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
            aspect.notes
              ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* Rename Title Button */}
        <button
          type="button"
          onClick={() => setIsEditingTitle(true)}
          title="Edit title"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        {/* Delete Aspect Button */}
        <button
          type="button"
          onClick={() => onDelete(aspect.id)}
          title="Delete aspect"
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
