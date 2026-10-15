import React, { useState, useMemo } from 'react';
import { Subject } from '../types';
import { calculateStats, downloadJsonFile } from '../services/storage';
import {
  Search,
  Sparkles,
  Plus,
  ArrowRight,
  MoreVertical,
  Download,
  Trash2,
  Edit2,
  Layers,
  CheckCircle2,
  Clock,
  Circle,
} from 'lucide-react';

interface SubjectListProps {
  subjects: Subject[];
  onSelectSubject: (subjectId: string) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onOpenNewModal: () => void;
  onOpenImportModal: () => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  onSelectSubject,
  onEditSubject,
  onDeleteSubject,
  onOpenNewModal,
  onOpenImportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'progress' | 'aspects'>('updated');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter and sort subjects
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((s) => {
        const query = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          s.categories.some((c) =>
            c.name.toLowerCase().includes(query) ||
            c.aspects.some((a) => a.title.toLowerCase().includes(query))
          )
        );
      })
      .sort((a, b) => {
        if (sortBy === 'progress') {
          const statsA = calculateStats(a.categories);
          const statsB = calculateStats(b.categories);
          return statsB.percent - statsA.percent;
        }
        if (sortBy === 'aspects') {
          const statsA = calculateStats(a.categories);
          const statsB = calculateStats(b.categories);
          return statsB.total - statsA.total;
        }
        // default: updated
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [subjects, searchQuery, sortBy]);

  // Total workspace aggregate metrics
  const totalAspectsCount = useMemo(() => {
    return subjects.reduce(
      (acc, s) => acc + s.categories.reduce((cAcc, c) => cAcc + c.aspects.length, 0),
      0
    );
  }, [subjects]);

  const handleExportSubject = (subject: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    const filename = `${subject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-brainstorm.json`;
    downloadJsonFile(filename, JSON.stringify(subject, null, 2));
    setActiveMenuId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Brainstorm Subjects
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track and master decomposed concepts, study topics, and deep brainstorms.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-4 text-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-2xs">
          <div>
            <span className="text-slate-400 block font-medium">Subjects</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {subjects.length}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-slate-400 block font-medium">Total Aspects</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {totalAspectsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subjects, categories, aspects..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <span className="text-slate-400 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          >
            <option value="updated">Recently Updated</option>
            <option value="progress">Highest Progress</option>
            <option value="aspects">Most Aspects</option>
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {searchQuery ? 'No matching subjects found' : 'No subjects created yet'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms.'
                : 'Create your first subject manually or import one instantly with an AI-generated prompt.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Subject</span>
            </button>
            <button
              type="button"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-semibold hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Import AI Subject</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => {
            const stats = calculateStats(subject.categories);
            const isMenuOpen = activeMenuId === subject.id;

            return (
              <div
                key={subject.id}
                onClick={() => onSelectSubject(subject.id)}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer"
              >
                {/* Subject Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {subject.title}
                    </h2>

                    {/* Context Menu Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : subject.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20 animate-in fade-in zoom-in-95"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onEditSubject(subject);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Title / Info</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleExportSubject(subject, e)}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export as JSON</span>
                          </button>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete "${subject.title}"?`)) {
                                onDeleteSubject(subject.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full px-3 py-1.5 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Subject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-4">
                    {subject.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress Section */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Progress
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {stats.percent}%
                      </span>
                    </div>

                    {/* Multi-segment Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      {/* Done Portion */}
                      {stats.total > 0 && stats.done > 0 && (
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${(stats.done / stats.total) * 100}%` }}
                          title={`${stats.done} Done`}
                        />
                      )}
                      {/* In Progress Portion */}
                      {stats.total > 0 && stats.inProgress > 0 && (
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                          title={`${stats.inProgress} In Progress`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Badges Breakdown */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {stats.done}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {stats.inProgress}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Circle className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {stats.notStarted}
                        </span>
                      </span>
                    </div>

                    <span className="font-medium text-slate-400">
                      {subject.categories.length} categories · {stats.total} aspects
                    </span>
                  </div>

                  {/* Open Subject Prompt */}
                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Brainstorm Board</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
