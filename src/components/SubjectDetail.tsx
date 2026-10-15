import React, { useState, useMemo } from 'react';
import { Subject, Category, Aspect } from '../types';
import { CategorySection } from './CategorySection';
import { AspectCard } from './AspectCard';
import { calculateStats, downloadJsonFile, generateId } from '../services/storage';
import {
  ArrowLeft,
  Search,
  Download,
  Edit2,
  CheckCircle2,
  Clock,
  Circle,
  FolderPlus,
  Layers,
  LayoutGrid,
  List,
  Filter,
  Folder,
} from 'lucide-react';

interface SubjectDetailProps {
  subject: Subject;
  onBack: () => void;
  onUpdateSubject: (updated: Subject) => void;
  onEditSubjectMeta: (subject: Subject) => void;
  onOpenNotes: (aspect: Aspect, categoryName: string) => void;
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subject,
  onBack,
  onUpdateSubject,
  onEditSubjectMeta,
  onOpenNotes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const stats = calculateStats(subject.categories);

  const handleExportSubject = () => {
    const filename = `${subject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brainstorm.json`;
    downloadJsonFile(filename, JSON.stringify(subject, null, 2));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const newCat: Category = {
      id: generateId(),
      name: trimmed,
      aspects: [],
    };

    onUpdateSubject({
      ...subject,
      categories: [...subject.categories, newCat],
      updatedAt: new Date().toISOString(),
    });

    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleUpdateCategory = (updatedCat: Category) => {
    onUpdateSubject({
      ...subject,
      categories: subject.categories.map((c) => (c.id === updatedCat.id ? updatedCat : c)),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    onUpdateSubject({
      ...subject,
      categories: subject.categories.filter((c) => c.id !== categoryId),
      updatedAt: new Date().toISOString(),
    });
    if (selectedCategoryId === categoryId) {
      setSelectedCategoryId('all');
    }
  };

  // Handlers for updating/deleting an aspect directly from Card View
  const handleUpdateAspectInCard = (categoryId: string, updatedAspect: Aspect) => {
    onUpdateSubject({
      ...subject,
      categories: subject.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              aspects: c.aspects.map((a) => (a.id === updatedAspect.id ? updatedAspect : a)),
            }
          : c
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteAspectInCard = (categoryId: string, aspectId: string) => {
    onUpdateSubject({
      ...subject,
      categories: subject.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              aspects: c.aspects.filter((a) => a.id !== aspectId),
            }
          : c
      ),
      updatedAt: new Date().toISOString(),
    });
  };

  // Visible categories for list view (filtered by selected category)
  const visibleCategories = useMemo(() => {
    return subject.categories.filter((cat) => {
      if (selectedCategoryId !== 'all' && cat.id !== selectedCategoryId) {
        return false;
      }
      return true;
    });
  }, [subject.categories, selectedCategoryId]);

  // Aggregated aspects for card view (respecting status, search, and category filters)
  const filteredAspectsForCards = useMemo(() => {
    const list: { aspect: Aspect; categoryId: string; categoryName: string }[] = [];
    for (const cat of subject.categories) {
      if (selectedCategoryId !== 'all' && cat.id !== selectedCategoryId) continue;
      for (const asp of cat.aspects) {
        const matchesStatus = !filterStatus || filterStatus === 'all' || asp.status === filterStatus;
        const matchesQuery =
          !searchQuery ||
          asp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (asp.notes && asp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        if (matchesStatus && matchesQuery) {
          list.push({ aspect: asp, categoryId: cat.id, categoryName: cat.name });
        }
      }
    }
    return list;
  }, [subject.categories, selectedCategoryId, filterStatus, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Subjects</span>
        </button>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher: List vs Cards */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="List View with Category headers"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Card View for high-level overview"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onEditSubjectMeta(subject)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Subject</span>
          </button>

          <button
            type="button"
            onClick={handleExportSubject}
            title="Download subject JSON"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Hero Stats & Subject Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Subject Brainstorm
              </span>
              <span className="text-xs text-slate-400">
                Last updated {new Date(subject.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {subject.title}
            </h1>

            {subject.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {subject.description}
              </p>
            )}
          </div>

          {/* Progress Overview Block */}
          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
            {/* Percentage Circle / Pill */}
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                {stats.percent}%
              </div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Overall Done
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200 dark:bg-slate-800" />

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {stats.done}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Done</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                  <Clock className="w-3.5 h-3.5" />
                  {stats.inProgress}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">In Progress</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-slate-500 font-bold text-sm">
                  <Circle className="w-3.5 h-3.5" />
                  {stats.notStarted}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {stats.total > 0 && stats.done > 0 && (
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(stats.done / stats.total) * 100}%` }}
              title={`${stats.done} Done`}
            />
          )}
          {stats.total > 0 && stats.inProgress > 0 && (
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
              title={`${stats.inProgress} In Progress`}
            />
          )}
        </div>
      </div>

      {/* Control Strip: Status Filters & Category Selector & Search */}
      <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        {/* Row 1: Status Filter Pills + Search + Add Category */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                filterStatus === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All Aspects ({stats.total})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('in_progress')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                filterStatus === 'in_progress'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>In Progress ({stats.inProgress})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('done')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                filterStatus === 'done'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Done ({stats.done})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('not_started')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                filterStatus === 'not_started'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Not Started ({stats.notStarted})</span>
            </button>
          </div>

          {/* Right side: Search & Add Category */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search aspects & notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Filter Selector (Chips/Bar) */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3 h-3" />
            Category:
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedCategoryId === 'all'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Categories ({subject.categories.length})
          </button>

          {subject.categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(isSelected ? 'all' : cat.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-slate-100/70 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Folder className="w-3 h-3 opacity-70" />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.aspects.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Category Form Banner */}
      {isAddingCategory && (
        <form
          onSubmit={handleAddCategory}
          className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in"
        >
          <input
            type="text"
            required
            autoFocus
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New Category name (e.g. Market Research, Technical Architecture...)"
            className="flex-1 px-3.5 py-2 text-xs font-semibold rounded-xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Add Category
            </button>
          </div>
        </form>
      )}

      {/* Aspects Display: List View vs Card View */}
      {viewMode === 'cards' ? (
        // CARD VIEW: No category headers, category shown on each card
        <div>
          {filteredAspectsForCards.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No aspects match your filters
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try switching the category, clearing the search query, or showing all aspect statuses.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('all');
                  setSelectedCategoryId('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-150">
              {filteredAspectsForCards.map(({ aspect, categoryId, categoryName }) => (
                <AspectCard
                  key={aspect.id}
                  aspect={aspect}
                  categoryId={categoryId}
                  categoryName={categoryName}
                  onUpdate={handleUpdateAspectInCard}
                  onDelete={handleDeleteAspectInCard}
                  onOpenNotes={onOpenNotes}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // LIST VIEW: Categories with headers (only shown if aspects match filter)
        <div className="space-y-4">
          {visibleCategories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-3">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No categories match the filter
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Show all categories
              </button>
            </div>
          ) : (
            visibleCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                filterStatus={filterStatus}
                searchQuery={searchQuery}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onOpenNotes={onOpenNotes}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
