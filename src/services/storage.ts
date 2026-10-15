import { Subject, Category, WorkspaceData, SubjectStats } from '../types';

const STORAGE_KEY = 'brainstorm_manager_workspace_v1';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export const SAMPLE_SUBJECT: Subject = {
  id: 'sample-ai-assistant',
  title: 'AI Personal Assistant & Second Brain',
  description: 'Deconstructing architecture, UX, integrations, and privacy for a personal assistant app.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  categories: [
    {
      id: 'cat-core-arch',
      name: 'Architecture & Storage',
      aspects: [
        {
          id: 'asp-1',
          title: 'Local-first offline sync vs Cloud-first model',
          status: 'done',
          notes: 'Decided on local-first with CRDT or Gist/WebDAV backup for maximum user privacy.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-2',
          title: 'Vector embeddings store (SQLite-vec vs IndexedDB)',
          status: 'in_progress',
          notes: 'Evaluating browser-based vector search using WebAssembly.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-3',
          title: 'Chunking strategies for complex documents',
          status: 'not_started',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-4',
          title: 'Cache invalidation on knowledge base edits',
          status: 'not_started',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'cat-llm-orchestration',
      name: 'LLM & Agent Orchestration',
      aspects: [
        {
          id: 'asp-5',
          title: 'Streaming response UX & token latency optimization',
          status: 'done',
          notes: 'Use Server-Sent Events or WebSockets with optimistic render.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-6',
          title: 'Multi-agent role specialization & tool calling',
          status: 'in_progress',
          notes: 'Define prompt contracts for planner, researcher, and critic subagents.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-7',
          title: 'Context window compression & summarization triggers',
          status: 'not_started',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-8',
          title: 'Fallback mechanisms when API rate limits occur',
          status: 'not_started',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'cat-user-experience',
      name: 'User Experience & Interactions',
      aspects: [
        {
          id: 'asp-9',
          title: 'Keyboard-first command palette (Cmd+K / Ctrl+K)',
          status: 'done',
          notes: 'Essential for power users navigating between 50+ topics.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-10',
          title: 'Visual progress breakdown and celebration triggers',
          status: 'done',
          notes: 'Progress bar and status counter per category and overall subject.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-11',
          title: 'Mobile touch friendly cards and swipe gestures',
          status: 'not_started',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-12',
          title: 'Dark and light theme contrast audit',
          status: 'not_started',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'cat-security',
      name: 'Privacy, Security & Export',
      aspects: [
        {
          id: 'asp-13',
          title: 'Zero-knowledge encryption for personal notes',
          status: 'not_started',
          notes: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-14',
          title: 'GitHub Gist export/sync with personal access token',
          status: 'in_progress',
          notes: 'Allows cross-device access with no third-party server hosting user data.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'asp-15',
          title: 'Full workspace JSON backup & restore verification',
          status: 'done',
          notes: 'One-click download and upload of raw JSON schema.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ],
};

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveSubjects([SAMPLE_SUBJECT]);
      return [SAMPLE_SUBJECT];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [SAMPLE_SUBJECT];
  } catch (err) {
    console.error('Failed to load subjects from localStorage:', err);
    return [SAMPLE_SUBJECT];
  }
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  } catch (err) {
    console.error('Failed to save subjects to localStorage:', err);
  }
}

export function calculateStats(categories: Category[] = []): SubjectStats {
  let total = 0;
  let notStarted = 0;
  let inProgress = 0;
  let done = 0;

  for (const cat of categories) {
    for (const asp of cat.aspects || []) {
      total++;
      if (asp.status === 'done') {
        done++;
      } else if (asp.status === 'in_progress') {
        inProgress++;
      } else {
        notStarted++;
      }
    }
  }

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, notStarted, inProgress, done, percent };
}

export function exportAllToJson(subjects: Subject[]): string {
  const data: WorkspaceData = {
    version: 1,
    subjects,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function parseWorkspaceBackup(raw: string): { success: boolean; subjects?: Subject[]; error?: string } {
  try {
    const parsed = JSON.parse(raw);
    let list: Subject[] = [];
    if (Array.isArray(parsed)) {
      list = parsed;
    } else if (parsed && Array.isArray(parsed.subjects)) {
      list = parsed.subjects;
    } else {
      return { success: false, error: 'File does not contain valid subjects list.' };
    }

    const validated: Subject[] = list.map((s, sIdx) => ({
      id: s.id || generateId(),
      title: s.title || `Subject ${sIdx + 1}`,
      description: s.description || '',
      createdAt: s.createdAt || new Date().toISOString(),
      updatedAt: s.updatedAt || new Date().toISOString(),
      categories: (s.categories || []).map((c: any, cIdx: number) => ({
        id: c.id || generateId(),
        name: c.name || `Category ${cIdx + 1}`,
        aspects: (c.aspects || []).map((a: any, aIdx: number) => ({
          id: a.id || generateId(),
          title: typeof a === 'string' ? a : (a.title || `Aspect ${aIdx + 1}`),
          notes: typeof a === 'object' ? (a.notes || '') : '',
          status: (a.status === 'done' || a.status === 'in_progress') ? a.status : 'not_started',
          createdAt: a.createdAt || new Date().toISOString(),
          updatedAt: a.updatedAt || new Date().toISOString(),
        })),
      })),
    }));

    return { success: true, subjects: validated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Malformed JSON backup file.' };
  }
}

export function parseSubjectImport(content: string): { success: boolean; subject?: Subject; error?: string } {
  const trimmed = content.trim();

  // Try parsing JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const rawSubject = Array.isArray(parsed) ? parsed[0] : parsed;

      if (!rawSubject || typeof rawSubject !== 'object') {
        return { success: false, error: 'JSON does not represent a valid subject object.' };
      }

      const categories: Category[] = (rawSubject.categories || []).map((c: any, cIdx: number) => ({
        id: c.id || generateId(),
        name: c.name || `Category ${cIdx + 1}`,
        aspects: (c.aspects || []).map((a: any, aIdx: number) => {
          if (typeof a === 'string') {
            return {
              id: generateId(),
              title: a,
              notes: '',
              status: 'not_started',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return {
            id: a.id || generateId(),
            title: a.title || `Aspect ${aIdx + 1}`,
            notes: a.notes || '',
            status: (a.status === 'done' || a.status === 'in_progress') ? a.status : 'not_started',
            createdAt: a.createdAt || new Date().toISOString(),
            updatedAt: a.updatedAt || new Date().toISOString(),
          };
        }),
      }));

      const subject: Subject = {
        id: generateId(),
        title: rawSubject.title || 'Imported Brainstorm Subject',
        description: rawSubject.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories,
      };

      return { success: true, subject };
    } catch {
      // Fall through to markdown parser if JSON fails
    }
  }

  // Markdown Parser (# Subject, ## Category, - Aspect)
  try {
    const lines = trimmed.split('\n');
    let title = 'Imported Brainstorm Subject';
    let description = '';
    const categories: Category[] = [];
    let currentCategory: Category | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('# ')) {
        title = line.replace('# ', '').trim();
      } else if (line.startsWith('## ')) {
        const catName = line.replace('## ', '').trim();
        currentCategory = {
          id: generateId(),
          name: catName,
          aspects: [],
        };
        categories.push(currentCategory);
      } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
        const aspectText = line.replace(/^[-*]|\d+\.\s/, '').trim();
        if (!currentCategory) {
          currentCategory = {
            id: generateId(),
            name: 'General Aspects',
            aspects: [],
          };
          categories.push(currentCategory);
        }
        currentCategory.aspects.push({
          id: generateId(),
          title: aspectText,
          notes: '',
          status: 'not_started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (!categories.length && !description) {
        description = line;
      }
    }

    if (categories.length === 0) {
      return {
        success: false,
        error: 'Could not extract categories and aspects. Make sure the text is either JSON or Markdown format with headers and bullet points.',
      };
    }

    const subject: Subject = {
      id: generateId(),
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories,
    };

    return { success: true, subject };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse subject file.' };
  }
}

export function downloadJsonFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const AI_PROMPT_TEMPLATE = `Please act as a domain expert and brainstorming strategist. 
Decompose the subject "[INSERT SUBJECT HERE]" into 5 to 10 logical categories, each containing 5 to 10 granular, insightful aspects or study topics to research and brainstorm.

Output ONLY valid JSON matching this schema:
{
  "title": "[Subject Name]",
  "description": "[Brief 1-2 sentence description]",
  "categories": [
    {
      "name": "[Category Name]",
      "aspects": [
        "[Aspect 1: specific question or sub-topic]",
        "[Aspect 2: specific question or sub-topic]"
      ]
    }
  ]
}`;
