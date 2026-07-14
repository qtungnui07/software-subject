import crypto from "crypto";

export const LOCAL_SESSION_COOKIE = "local_session";

export type LocalSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type LocalSessionPayload = {
  sid: string;
  user: LocalSessionUser;
  exp: number;
};

export type CreatedLocalSessionToken = {
  token: string;
  sessionId: string;
  expiresAt: Date;
};

const getSecret = () =>
  process.env.LOCAL_AUTH_SECRET ||
  process.env.CLERK_SECRET_KEY ||
  "robogo-local-dev-secret";

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

const sign = (payload: string) =>
  crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");

export const createLocalSessionToken = (user: LocalSessionUser) => {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const payload = encode({
    sid: sessionId,
    user,
    exp: expiresAt.getTime(),
  } satisfies LocalSessionPayload);

  return {
    token: `${payload}.${sign(payload)}`,
    sessionId,
    expiresAt,
  } satisfies CreatedLocalSessionToken;
};

export const hashLocalSessionToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const verifyLocalSessionToken = (token?: string): LocalSessionPayload | null => {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as LocalSessionPayload;

    if (!data.sid || !data.user?.id || !data.user.email || data.exp < Date.now()) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};
