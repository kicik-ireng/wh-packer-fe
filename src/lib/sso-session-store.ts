import 'server-only';
import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';
import { MemorySessionStore, type SessionStore, type StoredSession } from '@vuteq/sso-client-react';

const PREFIX = `${process.env.VUTEQ_SSO_REDIS_KEY_PREFIX ?? ''}exedy:sso:`;
const LOCK_PREFIX = `${PREFIX}lock:`;
const GLOBAL_KEY = '__exedyVuteqSsoRedis';
const LOCK_ACQUIRE_TIMEOUT_MS = 5_000;
const LOCK_LEASE_MS = 30_000;
const LOCK_RETRY_MS = 50;

const fallbackStore = new MemorySessionStore();
let redisAvailable: boolean | null = null;

function redisClient(): Redis | null {
  if (process.env.REDIS_ENABLED === 'false') return null;
  const globalStore = globalThis as typeof globalThis & { [GLOBAL_KEY]?: Redis };

  if (!globalStore[GLOBAL_KEY]) {
    try {
      const client = new Redis({
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.VUTEQ_SSO_REDIS_DB ?? 0),
        connectionName: 'exedy-web-sso-session',
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        retryStrategy: () => null, // don't hang if redis is not running
      });
      client.on('error', (err) => {
        redisAvailable = false;
      });
      client.on('connect', () => {
        redisAvailable = true;
      });
      globalStore[GLOBAL_KEY] = client;
    } catch {
      redisAvailable = false;
      return null;
    }
  }

  return globalStore[GLOBAL_KEY] ?? null;
}

const entryKey = (key: string): string => `${PREFIX}entry:${key}`;

async function parseStoredSession(redis: Redis, key: string, value: string): Promise<StoredSession | null> {
  try {
    const session = JSON.parse(value) as StoredSession;
    if (typeof session.expiresAt !== 'number' || session.expiresAt <= Date.now()) {
      await redis.del(key);
      return null;
    }
    return session;
  } catch {
    await redis.del(key);
    return null;
  }
}

const store: SessionStore = {
  async get(key) {
    const redis = redisClient();
    if (!redis || redisAvailable === false) {
      return fallbackStore.get(key);
    }
    try {
      const storageKey = entryKey(key);
      const value = await redis.get(storageKey);
      return value ? parseStoredSession(redis, storageKey, value) : null;
    } catch {
      return fallbackStore.get(key);
    }
  },

  async set(key, session) {
    const redis = redisClient();
    if (!redis || redisAvailable === false) {
      await fallbackStore.set(key, session);
      return;
    }
    try {
      const ttl = Math.max(1, session.expiresAt - Date.now());
      await redis.set(entryKey(key), JSON.stringify(session), 'PX', ttl);
    } catch {
      await fallbackStore.set(key, session);
    }
  },

  async take(key) {
    const redis = redisClient();
    if (!redis || redisAvailable === false) {
      return fallbackStore.take(key);
    }
    try {
      const storageKey = entryKey(key);
      const value = (await redis.eval(
        "local v=redis.call('GET',KEYS[1]); if v then redis.call('DEL',KEYS[1]); end; return v",
        1,
        storageKey,
      )) as string | null;
      return value ? parseStoredSession(redis, storageKey, value) : null;
    } catch {
      return fallbackStore.take(key);
    }
  },

  async delete(key) {
    const redis = redisClient();
    if (!redis || redisAvailable === false) {
      await fallbackStore.delete(key);
      return;
    }
    try {
      await redis.del(entryKey(key));
    } catch {
      await fallbackStore.delete(key);
    }
  },

  async deleteMatching(clientId, subject, sid) {
    const redis = redisClient();
    if (!redis || redisAvailable === false) {
      return fallbackStore.deleteMatching(clientId, subject, sid);
    }
    try {
      let cursor = '0';
      let deleted = 0;

      do {
        const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `${PREFIX}entry:*`, 'COUNT', 100);
        cursor = nextCursor;

        for (const key of keys) {
          const value = await redis.get(key);
          if (!value) continue;
          const session = await parseStoredSession(redis, key, value);
          if (
            session?.clientId === clientId &&
            ((subject && session.subject === subject) || (sid && session.sid === sid))
          ) {
            deleted += await redis.del(key);
          }
        }
      } while (cursor !== '0');

      return deleted;
    } catch {
      return fallbackStore.deleteMatching(clientId, subject, sid);
    }
  },

  async withLock(key, operation) {
    const redis = redisClient();
    if (!redis || redisAvailable === false) {
      return fallbackStore.withLock(key, operation);
    }
    try {
      const lockKey = `${LOCK_PREFIX}${key}`;
      const owner = randomUUID();
      const deadline = Date.now() + LOCK_ACQUIRE_TIMEOUT_MS;

      while ((await redis.set(lockKey, owner, 'PX', LOCK_LEASE_MS, 'NX')) !== 'OK') {
        if (Date.now() >= deadline) throw new Error('SSO session lock timed out');
        await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_MS));
      }

      try {
        return await operation();
      } finally {
        try {
          await redis.eval(
            "if redis.call('GET',KEYS[1]) == ARGV[1] then return redis.call('DEL',KEYS[1]) else return 0 end",
            1,
            lockKey,
            owner,
          );
        } catch {}
      }
    } catch {
      return fallbackStore.withLock(key, operation);
    }
  },
};

export const ssoSessionStore: SessionStore = store;
