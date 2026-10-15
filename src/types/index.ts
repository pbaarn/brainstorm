export type AspectStatus = 'not_started' | 'in_progress' | 'done';

export interface Aspect {
  id: string;
  title: string;
  notes?: string;
  status: AspectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  aspects: Aspect[];
}

export interface Subject {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

export interface WorkspaceData {
  version: number;
  subjects: Subject[];
  exportedAt?: string;
}

export interface GistSyncConfig {
  enabled: boolean;
  token: string;
  gistId: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface SubjectStats {
  total: number;
  notStarted: number;
  inProgress: number;
  done: number;
  percent: number;
}
