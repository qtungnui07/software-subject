import "server-only";

import { and, eq, gt, isNull } from "drizzle-orm";

import db from "@/db/drizzle";
import { localSessions, users } from "@/db/schema";
import {
  createLocalSessionToken,
  hashLocalSessionToken,
  verifyLocalSessionToken,
  type LocalSessionUser,
} from "@/lib/local-session";

export const createPersistedLocalSession = async (user: LocalSessionUser) => {
  const createdSession = createLocalSessionToken(user);

  await db.insert(localSessions).values({
    sessionId: createdSession.sessionId,
    userId: user.id,
    tokenHash: hashLocalSessionToken(createdSession.token),
    expiresAt: createdSession.expiresAt,
  });

  return createdSession;
};

export const revokeLocalSessionToken = async (token?: string) => {
  const payload = verifyLocalSessionToken(token);

  if (!token || !payload) {
    return;
  }

  await db
    .update(localSessions)
    .set({
      revokedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(localSessions.sessionId, payload.sid));
};

export const getValidLocalSessionUser = async (token?: string) => {
  const payload = verifyLocalSessionToken(token);

  if (!token || !payload) {
    return null;
  }

  const tokenHash = hashLocalSessionToken(token);
  const session = await db.query.localSessions.findFirst({
    where: and(
      eq(localSessions.sessionId, payload.sid),
      eq(localSessions.tokenHash, tokenHash),
      isNull(localSessions.revokedAt),
      gt(localSessions.expiresAt, new Date())
    ),
  });

  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: payload.user.id.startsWith("user_")
      ? eq(users.clerkUserId, payload.user.id)
      : eq(users.id, Number(payload.user.id)),
  });

  if (!user) {
    await revokeLocalSessionToken(token);
    return null;
  }

  return {
    id: payload.user.id,
    name: user.name,
    email: user.email,
    image: user.imageSrc || "/mascot.svg",
  };
};
