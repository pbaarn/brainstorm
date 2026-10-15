import React, { useState, useEffect, useRef } from 'react';
import { Subject, Aspect, GistSyncConfig } from './types';
import {
  loadSubjects,
  saveSubjects,
  exportAllToJson,
  parseWorkspaceBackup,
  downloadJsonFile,
} from './services/storage';
import { loadGistConfig, saveGistConfig, pushToGist } from './services/gist';
import { Header } from './components/Header';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { AspectNotesModal } from './components/AspectNotesModal';
import { ImportModal } from './components/ImportModal';
import { GistModal } from './components/GistModal';
import { SubjectEditModal } from './components/SubjectEditModal';

export const App: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [gistConfig, setGistConfig] = useState<GistSyncConfig>(() => loadGistConfig());

  // Modals state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGistModalOpen, setIsGistModalOpen] = useState(false);
  const [isNewSubjectModalOpen, setIsNewSubjectModalOpen] = useState(false);
  const [editingSubjectMeta, setEditingSubjectMeta] = useState<Subject | null>(null);
  const [notesTarget, setNotesTarget] = useState<{ aspect: Aspect; categoryName: string } | null>(null);

  // Debounce auto-sync to Gist
  const autoSyncTimeoutRef = useRef<number | null>(null);

  // Persist to localStorage whenever subjects change
  useEffect(() => {
    saveSubjects(subjects);

    // Auto-sync to Gist if enabled
    if (gistConfig.enabled && gistConfig.autoSync && gistConfig.token && gistConfig.gistId) {
      if (autoSyncTimeoutRef.current) {
        window.clearTimeout(autoSyncTimeoutRef.current);
      }
      autoSyncTimeoutRef.current = window.setTimeout(async () => {
        try {
          const res = await pushToGist(gistConfig.token, gistConfig.gistId, subjects);
          if (res.success) {
            const updatedConfig = { ...gistConfig, lastSyncedAt: new Date().toISOString() };
            setGistConfig(updatedConfig);
            saveGistConfig(updatedConfig);
          }
        } catch (err) {
          console.error('Auto-sync to Gist failed:', err);
        }
      }, 3000);
    }

    return () => {
      if (autoSyncTimeoutRef.current) {
        window.clearTimeout(autoSyncTimeoutRef.current);
      }
    };
  }, [subjects, gistConfig.enabled, gistConfig.autoSync, gistConfig.token, gistConfig.gistId]);

  // Selected subject
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Subject CRUD handlers
  const handleSaveSubject = (savedSubject: Subject) => {
    const exists = subjects.some((s) => s.id === savedSubject.id);
    if (exists) {
      setSubjects((prev) => prev.map((s) => (s.id === savedSubject.id ? savedSubject : s)));
    } else {
      setSubjects((prev) => [savedSubject, ...prev]);
      setSelectedSubjectId(savedSubject.id);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
    }
  };

  const handleImportSubject = (newSubject: Subject) => {
    setSubjects((prev) => [newSubject, ...prev]);
    setSelectedSubjectId(newSubject.id);
  };

  // Full Workspace Backup & Restore
  const handleBackupWorkspace = () => {
    const jsonStr = exportAllToJson(subjects);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadJsonFile(`brainstorm-workspace-backup-${dateStr}.json`, jsonStr);
  };

  const handleRestoreWorkspace = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = parseWorkspaceBackup(content);
      if (result.success && result.subjects) {
        if (
          window.confirm(
            `Restore workspace with ${result.subjects.length} subjects? This replaces current subjects.`
          )
        ) {
          setSubjects(result.subjects);
          setSelectedSubjectId(null);
        }
      } else {
        alert(result.error || 'Failed to restore workspace.');
      }
    };
    reader.readAsText(file);
  };

  // Aspect Notes update handler
  const handleSaveAspectNotes = (notes: string, status: Aspect['status'], title: string) => {
    if (!notesTarget || !currentSubject) return;

    const updatedCategories = currentSubject.categories.map((cat) => ({
      ...cat,
      aspects: cat.aspects.map((asp) =>
        asp.id === notesTarget.aspect.id
          ? {
              ...asp,
              title,
              notes,
              status,
              updatedAt: new Date().toISOString(),
            }
          : asp
      ),
    }));

    handleSaveSubject({
      ...currentSubject,
      categories: updatedCategories,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        gistConfig={gistConfig}
        currentSubjectTitle={currentSubject ? currentSubject.title : undefined}
        onOpenGistModal={() => setIsGistModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenNewSubjectModal={() => setIsNewSubjectModalOpen(true)}
        onBackupWorkspace={handleBackupWorkspace}
        onRestoreWorkspace={handleRestoreWorkspace}
        onNavigateHome={() => setSelectedSubjectId(null)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentSubject ? (
          <SubjectDetail
            subject={currentSubject}
            onBack={() => setSelectedSubjectId(null)}
            onUpdateSubject={handleSaveSubject}
            onEditSubjectMeta={(sub) => setEditingSubjectMeta(sub)}
            onOpenNotes={(aspect, categoryName) => setNotesTarget({ aspect, categoryName })}
          />
        ) : (
          <SubjectList
            subjects={subjects}
            onSelectSubject={(id) => setSelectedSubjectId(id)}
            onEditSubject={(sub) => setEditingSubjectMeta(sub)}
            onDeleteSubject={handleDeleteSubject}
            onOpenNewModal={() => setIsNewSubjectModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <SubjectEditModal
        isOpen={isNewSubjectModalOpen}
        onClose={() => setIsNewSubjectModalOpen(false)}
        onSave={handleSaveSubject}
      />

      <SubjectEditModal
        isOpen={Boolean(editingSubjectMeta)}
        subject={editingSubjectMeta}
        onClose={() => setEditingSubjectMeta(null)}
        onSave={handleSaveSubject}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSubject}
      />

      <GistModal
        isOpen={isGistModalOpen}
        onClose={() => setIsGistModalOpen(false)}
        config={gistConfig}
        onConfigChange={(newCfg) => setGistConfig(newCfg)}
        subjects={subjects}
        onSubjectsUpdatedFromGist={(newSubs) => {
          setSubjects(newSubs);
          setSelectedSubjectId(null);
        }}
      />

      {notesTarget && (
        <AspectNotesModal
          isOpen={Boolean(notesTarget)}
          aspect={notesTarget.aspect}
          categoryName={notesTarget.categoryName}
          onClose={() => setNotesTarget(null)}
          onSave={handleSaveAspectNotes}
        />
      )}
    </div>
  );
};
export default App;
