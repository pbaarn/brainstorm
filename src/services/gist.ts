import { GistSyncConfig, Subject, WorkspaceData } from '../types';

const GIST_CONFIG_KEY = 'brainstorm_manager_gist_config_v1';
const GIST_FILENAME = 'brainstorm-manager-data.json';

export function loadGistConfig(): GistSyncConfig {
  try {
    const raw = localStorage.getItem(GIST_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load Gist config:', err);
  }
  return {
    enabled: false,
    token: '',
    gistId: '',
    autoSync: false,
  };
}

export function saveGistConfig(config: GistSyncConfig): void {
  try {
    localStorage.setItem(GIST_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save Gist config:', err);
  }
}

export async function verifyGitHubToken(token: string): Promise<{ valid: boolean; username?: string; error?: string }> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { valid: false, error: 'Invalid GitHub Personal Access Token.' };
      }
      return { valid: false, error: `GitHub API error: ${res.statusText}` };
    }

    const data = await res.json();
    return { valid: true, username: data.login };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Network connection failed.' };
  }
}

export async function createGistFromSubjects(token: string, subjects: Subject[]): Promise<{ success: boolean; gistId?: string; error?: string }> {
  try {
    const payload: WorkspaceData = {
      version: 1,
      subjects,
      exportedAt: new Date().toISOString(),
    };

    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Brainstorm Manager Workspace (Automated Sync)',
        public: false, // Secret Gist
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(payload, null, 2),
          },
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.message || `HTTP ${res.status}: Failed to create Gist.` };
    }

    const data = await res.json();
    return { success: true, gistId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to connect to GitHub API.' };
  }
}

export async function pushToGist(token: string, gistId: string, subjects: Subject[]): Promise<{ success: boolean; error?: string }> {
  try {
    const payload: WorkspaceData = {
      version: 1,
      subjects,
      exportedAt: new Date().toISOString(),
    };

    const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `Brainstorm Manager Workspace (Last sync: ${new Date().toLocaleTimeString()})`,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(payload, null, 2),
          },
        },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.message || `HTTP ${res.status}: Failed to update Gist.` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update Gist.' };
  }
}

export async function pullFromGist(token: string, gistId: string): Promise<{ success: boolean; subjects?: Subject[]; error?: string }> {
  try {
    const res = await fetch(`https://api.github.com/gists/${gistId.trim()}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, error: 'Gist not found. Please verify the Gist ID.' };
      }
      return { success: false, error: `HTTP ${res.status}: Could not fetch Gist.` };
    }

    const data = await res.json();
    const file = data.files && data.files[GIST_FILENAME];

    if (!file || !file.content) {
      return { success: false, error: `Gist exists, but does not contain '${GIST_FILENAME}'.` };
    }

    const parsed = JSON.parse(file.content);
    const subjects = Array.isArray(parsed) ? parsed : (parsed.subjects || []);

    return { success: true, subjects };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to pull data from Gist.' };
  }
}
