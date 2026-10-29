import { toClientSession } from '@vuteq/sso-client-react';
import { apiFetch, dependencyUnavailable } from '@/src/lib/server-api';
import { sso } from '@/src/lib/sso';

export const dynamic = 'force-dynamic';

type LocalProfile = {
  Id?: string;
  Name?: string;
  UserName?: string;
  Email?: string | null;
  EmailVerified?: boolean;
  GlobalRoles?: string[];
  LocalRole?: string | null;
  RoleName?: string | null;
  Permissions?: string[];
  IsActive?: boolean;
  AccessStatus?: 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'UNAVAILABLE';
};

type ProfileEnvelope = { data?: LocalProfile };
type ProfileResult = { ok: boolean; status: number; envelope?: ProfileEnvelope };
const profileRequests = new Map<string, Promise<ProfileResult>>();

async function loadProfile(request: Request, subject: string): Promise<ProfileResult> {
  const active = profileRequests.get(subject);
  if (active) return active;

  const pending = (async () => {
    try {
      const response = await apiFetch(request, '/auth/profile');
      return {
        ok: response.ok,
        status: response.status,
        envelope: response.ok ? ((await response.json()) as ProfileEnvelope) : undefined,
      };
    } catch {
      return { ok: false, status: 503 };
    }
  })();
  profileRequests.set(subject, pending);
  try {
    return await pending;
  } finally {
    if (profileRequests.get(subject) === pending) profileRequests.delete(subject);
  }
}

export async function GET(request: Request) {
  const session = await sso.session(request);
  if (!session) {
    const headers = new Headers({ 'Cache-Control': 'no-store' });
    headers.append(
      'Set-Cookie',
      '__Host-exedy_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    );
    headers.append(
      'Set-Cookie',
      'exedy_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    );
    return Response.json(null, { headers });
  }

  try {
    const profile = await loadProfile(request, session.profile.sub);
    const profileData = profile.envelope?.data;

    const isGlobalAdmin =
      session.globalRoles.includes('GLOBAL_ADMINISTRATOR') ||
      session.globalRoles.includes('SUPER_ADMINISTRATOR') ||
      session.globalRoles.includes('admin');

    const roleName = isGlobalAdmin
      ? 'admin'
      : (profileData?.LocalRole ?? profileData?.RoleName ?? 'none');

    const accessStatus = isGlobalAdmin
      ? 'ACTIVE'
      : (profileData?.AccessStatus ?? 'ACTIVE');

    const permissions = isGlobalAdmin
      ? [...new Set([...(profileData?.Permissions ?? []), 'SUPER', '*'])]
      : (profileData?.Permissions ?? []);

    const attributes = {
      ...profileData,
      RoleName: roleName,
      AccessStatus: accessStatus,
      isAdmin: roleName === 'admin',
    };

    const safe = toClientSession(session, {
      roles: [roleName],
      permissions,
      attributes,
    });

    return Response.json(safe, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return dependencyUnavailable('/api/auth/session');
  }
}
