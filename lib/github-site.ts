import 'server-only';
import { validateSiteContent, type SiteContent } from '../app/content';

const API = 'https://api.github.com';
type GithubConfig = { token: string; owner: string; repo: string; branch: string; path: string };

class GithubApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function conflict(): Error {
  const error = new Error('GitHub content changed after this editor was loaded. Refresh before saving.');
  error.name = 'ConflictError';
  return error;
}

function config(): GithubConfig {
  const required = ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'] as const;
  for (const name of required) if (!process.env[name]) throw new Error(`${name} is not configured`);
  return { token: process.env.GITHUB_TOKEN!, owner: process.env.GITHUB_OWNER!, repo: process.env.GITHUB_REPO!, branch: process.env.GITHUB_BRANCH!, path: process.env.GITHUB_SITE_DATA_PATH || 'data/site.json' };
}

async function github<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${config().token}`, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });
  if (!response.ok) throw new GithubApiError(response.status, `GitHub API ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json() as Promise<T>;
}

const encodePath = (value: string) => value.split('/').map(encodeURIComponent).join('/');

export async function readSiteFromGithub(): Promise<{ data: SiteContent; version: string }> {
  const { owner, repo, branch, path } = config();
  const file = await github<{ type: string; sha: string; content: string; encoding: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`);
  if (file.type !== 'file' || file.encoding !== 'base64') throw new Error('Configured site data path is not a file');
  const data = validateSiteContent(JSON.parse(Buffer.from(file.content.replace(/\n/g, ''), 'base64').toString('utf8')));
  return { data, version: file.sha };
}

export async function saveSiteToGithub(data: SiteContent, expectedVersion: string) {
  const { owner, repo, branch, path } = config();
  const prefix = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const current = await readSiteFromGithub();
  if (current.version !== expectedVersion) throw conflict();
  const ref = await github<{ object: { sha: string } }>(`${prefix}/git/ref/heads/${encodePath(branch)}`);
  const commit = await github<{ tree: { sha: string } }>(`${prefix}/git/commits/${ref.object.sha}`);
  const blob = await github<{ sha: string }>(`${prefix}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: `${JSON.stringify(data, null, 2)}\n`, encoding: 'utf-8' }) });
  const tree = await github<{ sha: string }>(`${prefix}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree: [{ path, mode: '100644', type: 'blob', sha: blob.sha }] }) });
  const newCommit = await github<{ sha: string }>(`${prefix}/git/commits`, { method: 'POST', body: JSON.stringify({ message: 'Update site content from admin', tree: tree.sha, parents: [ref.object.sha] }) });
  try {
    await github(`${prefix}/git/refs/heads/${encodePath(branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: newCommit.sha, force: false }) });
  } catch (error) {
    // A non-fast-forward rejection means another writer moved the branch after our check.
    if (error instanceof GithubApiError && error.status === 422) throw conflict();
    throw error;
  }
  return { commitSha: newCommit.sha, version: blob.sha };
}
