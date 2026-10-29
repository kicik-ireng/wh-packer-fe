import { withBasePath } from './base-path';

export async function bffRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const response = await fetch(withBasePath(`/api/proxy/${normalizedPath}`), {
    ...init,
    cache: 'no-store',
  });
  const body = (await response.json().catch(() => null)) as ({ message?: string } & T) | null;
  if (!response.ok || !body) {
    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }
  return body;
}
