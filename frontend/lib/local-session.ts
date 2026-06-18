import crypto from "crypto";

export const LOCAL_SESSION_COOKIE = "local_session";

export type LocalSessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type LocalSessionPayload = {
  user: LocalSessionUser;
  exp: number;
};

const getSecret = () =>
  process.env.LOCAL_AUTH_SECRET ||
  process.env.CLERK_SECRET_KEY ||
  process.env.DATABASE_URL ||
  "robogo-local-dev-secret";

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

const sign = (payload: string) =>
  crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");

export const createLocalSessionToken = (user: LocalSessionUser) => {
  const payload = encode({
    user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  } satisfies LocalSessionPayload);

  return `${payload}.${sign(payload)}`;
};

export const verifyLocalSessionToken = (token?: string): LocalSessionUser | null => {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as LocalSessionPayload;

    if (!data.user?.id || !data.user.email || data.exp < Date.now()) {
      return null;
    }

    return data.user;
  } catch {
    return null;
  }
};
