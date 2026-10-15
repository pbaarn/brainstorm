import React, { useState } from 'react';
import { Category, Aspect } from '../types';
import { AspectItem } from './AspectItem';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Check, Folder } from 'lucide-react';
import { generateId } from '../services/storage';

interface CategorySectionProps {
  category: Category;
  filterStatus: string | null;
  searchQuery: string;
  onUpdateCategory: (updated: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onOpenNotes: (aspect: Aspect, categoryName: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  filterStatus,
  searchQuery,
  onUpdateCategory,
  onDeleteCategory,
  onOpenNotes,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(category.name);
  const [newAspectTitle, setNewAspectTitle] = useState('');

  // Calculate category stats
  const totalAspects = category.aspects.length;
  const doneAspects = category.aspects.filter((a) => a.status === 'done').length;
  const inProgressAspects = category.aspects.filter((a) => a.status === 'in_progress').length;
  const percent = totalAspects === 0 ? 0 : Math.round((doneAspects / totalAspects) * 100);

  // Filtered aspects based on search query and status filter
  const filteredAspects = category.aspects.filter((aspect) => {
    const matchesStatus = !filterStatus || filterStatus === 'all' || aspect.status === filterStatus;
    const matchesQuery =
      !searchQuery ||
      aspect.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (aspect.notes && aspect.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== category.name) {
      onUpdateCategory({ ...category, name: trimmed });
    } else {
      setNameInput(category.name);
    }
    setIsEditingName(false);
  };

  const handleAddAspect = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAspectTitle.trim();
    if (!trimmed) return;

    const newAspect: Aspect = {
      id: generateId(),
      title: trimmed,
      notes: '',
      status: 'not_started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateCategory({
      ...category,
      aspects: [...category.aspects, newAspect],
    });

    setNewAspectTitle('');
  };

  const handleUpdateAspect = (updated: Aspect) => {
    onUpdateCategory({
      ...category,
      aspects: category.aspects.map((a) => (a.id === updated.id ? updated : a)),
    });
  };

  const handleDeleteAspect = (aspectId: string) => {
    onUpdateCategory({
      ...category,
      aspects: category.aspects.filter((a) => a.id !== aspectId),
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-200 hover:shadow-sm">
      {/* Category Header Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          <Folder className="w-4 h-4 text-indigo-500 shrink-0" />

          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                autoFocus
                className="text-base font-semibold px-2 py-0.5 rounded-md border border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="p-1 text-emerald-600 hover:text-emerald-700"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h3
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {category.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                title="Rename category"
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Progress stats */}
          <div className="flex items-center gap-2 text-xs">
            {inProgressAspects > 0 && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-medium">
                {inProgressAspects} in progress
              </span>
            )}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {doneAspects}/{totalAspects} done
            </span>
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-slate-400 font-medium w-8 text-right">{percent}%</span>
          </div>

          {/* Delete Category Button */}
          <button
            type="button"
            onClick={() => {
              if (
                category.aspects.length === 0 ||
                window.confirm(`Delete category "${category.name}" and its ${category.aspects.length} aspects?`)
              ) {
                onDeleteCategory(category.id);
              }
            }}
            title="Delete category"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Aspects List */}
      {!isCollapsed && (
        <div className="p-4 space-y-2.5">
          {filteredAspects.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">
              {category.aspects.length === 0
                ? 'No aspects yet. Add your first aspect below!'
                : 'No aspects match your search or filter.'}
            </div>
          ) : (
            filteredAspects.map((aspect) => (
              <AspectItem
                key={aspect.id}
                aspect={aspect}
                categoryName={category.name}
                onUpdate={handleUpdateAspect}
                onDelete={handleDeleteAspect}
                onOpenNotes={(asp) => onOpenNotes(asp, category.name)}
              />
            ))
          )}

          {/* Quick Add Aspect input */}
          <form onSubmit={handleAddAspect} className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={newAspectTitle}
                onChange={(e) => setNewAspectTitle(e.target.value)}
                placeholder={`+ Add aspect to "${category.name}" and press Enter...`}
                className="w-full text-xs font-medium pl-3 pr-10 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-solid focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              <button
                type="submit"
                disabled={!newAspectTitle.trim()}
                title="Add aspect"
                className="absolute right-2 p-1 rounded-md text-slate-400 hover:text-indigo-600 disabled:opacity-40 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
