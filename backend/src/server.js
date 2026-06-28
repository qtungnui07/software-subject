const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const postgres = require("postgres");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
};

loadEnvFile(path.resolve(__dirname, "..", ".env"));
loadEnvFile(path.resolve(__dirname, "..", "..", "frontend", ".env.local"));

const port = Number(process.env.PORT || 4000);
const databaseUrl = process.env.DATABASE_URL;
const apiKey = process.env.BACKEND_API_KEY;

const sql = databaseUrl ? postgres(databaseUrl, { max: 5 }) : null;

const sendJson = (res, status, data) => {
  const body = JSON.stringify(data);

  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
};

const logRequest = (req, status, message = "") => {
  const suffix = message ? ` ${message}` : "";
  console.log(`${new Date().toISOString()} ${req.method} ${req.url} ${status}${suffix}`);
};

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });

const requireDatabase = () => {
  if (!sql) {
    throw new Error("DATABASE_URL is not set");
  }
};

const requireApiKey = (req) => {
  if (!apiKey) {
    return;
  }

  if (req.headers["x-backend-api-key"] !== apiKey) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const requireUserId = (req) => {
  const userId = String(req.headers["x-user-id"] || "").trim();

  if (!userId) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  if (!userId.startsWith("user_") && !/^\d+$/.test(userId)) {
    const error = new Error("Invalid user id");
    error.status = 400;
    throw error;
  }

  return userId;
};

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${hash}`;
};

const verifyPassword = (password, storedHash) => {
  const [algorithm, salt, hash] = String(storedHash || "").split("$");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const actual = Buffer.from(hash, "hex");
  const expected = crypto.scryptSync(password, salt, 64);

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

const publicUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  image: user.image_src || "/mascot.svg",
});

const createLocalUser = async (payload) => {
  requireDatabase();

  const name = String(payload.name || "").trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");

  if (!name || !email || !password) {
    const error = new Error("name, email and password are required");
    error.status = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters");
    error.status = 400;
    throw error;
  }

  try {
    const [user] = await sql`
      insert into users (name, email, password_hash, image_src, updated_at)
      values (${name}, ${email}, ${hashPassword(password)}, '/mascot.svg', now())
      returning id, email, name, image_src
    `;

    return publicUser(user);
  } catch (error) {
    if (error.code === "23505") {
      const conflict = new Error("Email already exists");
      conflict.status = 409;
      throw conflict;
    }

    throw error;
  }
};

const signInLocalUser = async (payload) => {
  requireDatabase();

  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "");
  const [user] = await sql`
    select id, email, name, image_src, password_hash
    from users
    where email = ${email}
    limit 1
  `;

  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return publicUser(user);
};

const syncUser = async (payload) => {
  requireDatabase();

  const clerkUserId = String(payload.clerkUserId || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const name = String(payload.name || "User").trim() || "User";
  const imageSrc = String(payload.imageSrc || "/mascot.svg").trim() || "/mascot.svg";

  if (!clerkUserId || !email) {
    const error = new Error("clerkUserId and email are required");
    error.status = 400;
    throw error;
  }

  const [user] = await sql`
    insert into users (clerk_user_id, name, email, image_src, updated_at)
    values (${clerkUserId}, ${name}, ${email}, ${imageSrc}, now())
    on conflict (clerk_user_id) do update set
      name = excluded.name,
      email = excluded.email,
      image_src = excluded.image_src,
      updated_at = now()
    returning id, clerk_user_id, email, name, image_src, created_at, updated_at
  `;

  return user;
};

const listUsers = async () => {
  requireDatabase();

  const users = await sql`
    select
      id,
      clerk_user_id,
      name,
      email,
      image_src,
      created_at,
      updated_at,
      password_hash is not null as has_password
    from users
    order by created_at desc, id desc
  `;

  return users.map((user) => ({
    id: String(user.id),
    clerkUserId: user.clerk_user_id,
    name: user.name,
    email: user.email,
    imageSrc: user.image_src || "/mascot.svg",
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    authProvider: user.clerk_user_id ? "clerk" : "local",
    hasPassword: user.has_password,
  }));
};

const deleteUser = async (id) => {
  requireDatabase();

  const [user] = await sql`
    delete from users
    where id = ${id}
    returning id, email
  `;

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  return { id: String(user.id), email: user.email };
};

const findAccount = async (userId, database = sql) => {
  requireDatabase();

  const [user] = userId.startsWith("user_")
    ? await database`
        select id, clerk_user_id, name, email, image_src
        from users
        where clerk_user_id = ${userId}
        limit 1
      `
    : await database`
        select id, clerk_user_id, name, email, image_src
        from users
        where id = ${Number(userId)}
        limit 1
      `;

  if (!user) {
    const error = new Error("Account not found");
    error.status = 404;
    throw error;
  }

  return user;
};

const accountResponse = (user) => ({
  name: user.name,
  email: user.email,
  isClerk: Boolean(user.clerk_user_id),
});

const getAccount = async (userId) => accountResponse(await findAccount(userId));

const updateAccount = async (userId, payload) => {
  requireDatabase();

  const name = String(payload.name || "").trim();
  const email = normalizeEmail(payload.email);

  if (!name || !email) {
    const error = new Error("name and email are required");
    error.status = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("Invalid email address");
    error.status = 400;
    throw error;
  }

  try {
    return await sql.begin(async (transaction) => {
      const existing = await findAccount(userId, transaction);

      if (existing.clerk_user_id && email !== existing.email) {
        const error = new Error("Email for Clerk accounts cannot be changed here");
        error.status = 400;
        throw error;
      }

      const [updated] = existing.clerk_user_id
        ? await transaction`
            update users
            set name = ${name}, updated_at = now()
            where clerk_user_id = ${userId}
            returning id, clerk_user_id, name, email
          `
        : await transaction`
            update users
            set name = ${name}, email = ${email}, updated_at = now()
            where id = ${Number(userId)}
            returning id, clerk_user_id, name, email
          `;

      await transaction`
        insert into user_progress (user_id, user_name)
        values (${userId}, ${name})
        on conflict (user_id) do update set user_name = excluded.user_name
      `;

      return accountResponse(updated);
    });
  } catch (error) {
    if (error.code === "23505") {
      const conflict = new Error("Email already exists");
      conflict.status = 409;
      throw conflict;
    }

    throw error;
  }
};

const getProfile = async (userId) => {
  requireDatabase();

  const account = await findAccount(userId);
  const [progress] = await sql`
    select
      user_progress.user_name,
      user_progress.user_image_src,
      user_progress.hearts,
      user_progress.points,
      courses.id as course_id,
      courses.title as course_title,
      courses."imageSrc" as course_image_src
    from user_progress
    left join courses on courses.id = user_progress.active_course_id
    where user_progress.user_id = ${userId}
    limit 1
  `;

  return {
    name: progress?.user_name || account.name,
    email: account.email,
    imageSrc: progress?.user_image_src || account.image_src || "/mascot.svg",
    hearts: progress?.hearts ?? 5,
    points: progress?.points ?? 0,
    activeCourse: progress?.course_id
      ? {
          id: progress.course_id,
          title: progress.course_title,
          imageSrc: progress.course_image_src,
        }
      : null,
  };
};

const updateProfile = async (userId, payload) => {
  requireDatabase();

  const name = String(payload.name || "").trim();
  const imageSrc = String(payload.imageSrc || "").trim();

  if (!name || !imageSrc) {
    const error = new Error("name and imageSrc are required");
    error.status = 400;
    throw error;
  }

  if (name.length > 30) {
    const error = new Error("Name must not exceed 30 characters");
    error.status = 400;
    throw error;
  }

  if (imageSrc.length > 2048 || (!imageSrc.startsWith("/") && !/^https?:\/\//i.test(imageSrc))) {
    const error = new Error("Invalid image source");
    error.status = 400;
    throw error;
  }

  await findAccount(userId);
  await sql`
    insert into user_progress (user_id, user_name, user_image_src)
    values (${userId}, ${name}, ${imageSrc})
    on conflict (user_id) do update set
      user_name = excluded.user_name,
      user_image_src = excluded.user_image_src
  `;

  return getProfile(userId);
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/health") {
      logRequest(req, 200);
      sendJson(res, 200, {
        ok: true,
        service: "duolingo-backend",
        databaseConfigured: Boolean(databaseUrl),
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/health/db") {
      requireDatabase();
      await sql`select 1`;
      logRequest(req, 200);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/users/count") {
      requireApiKey(req);
      requireDatabase();
      const [row] = await sql`select count(*)::int as count from users`;
      logRequest(req, 200, `count=${row.count}`);
      sendJson(res, 200, row);
      return;
    }

    if (req.method === "GET" && url.pathname === "/settings/account") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const account = await getAccount(userId);
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, account });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/settings/account") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const account = await updateAccount(userId, await readJson(req));
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, account });
      return;
    }

    if (req.method === "GET" && url.pathname === "/profile") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const profile = await getProfile(userId);
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, profile });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/profile") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const profile = await updateProfile(userId, await readJson(req));
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, profile });
      return;
    }

    if (req.method === "GET" && url.pathname === "/admin/users") {
      requireApiKey(req);
      const users = await listUsers();
      logRequest(req, 200, `count=${users.length}`);
      sendJson(res, 200, { ok: true, users });
      return;
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/admin/users/")) {
      requireApiKey(req);
      const id = url.pathname.split("/").pop();
      const user = await deleteUser(id);
      logRequest(req, 200, `user_id=${user.id}`);
      sendJson(res, 200, { ok: true, user });
      return;
    }

    if (req.method === "POST" && url.pathname === "/auth/sign-up") {
      const user = await createLocalUser(await readJson(req));
      logRequest(req, 200, `user_id=${user.id}`);
      sendJson(res, 200, { ok: true, user });
      return;
    }

    if (req.method === "POST" && url.pathname === "/auth/sign-in") {
      const user = await signInLocalUser(await readJson(req));
      logRequest(req, 200, `user_id=${user.id}`);
      sendJson(res, 200, { ok: true, user });
      return;
    }

    if (req.method === "POST" && url.pathname === "/internal/users/sync") {
      requireApiKey(req);
      const user = await syncUser(await readJson(req));
      logRequest(req, 200, `clerk_user_id=${user.clerk_user_id}`);
      sendJson(res, 200, { ok: true, user });
      return;
    }

    logRequest(req, 404);
    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    const status = error.status || 500;
    logRequest(req, status, error.message);
    sendJson(res, status, {
      error: status === 500 ? "Internal server error" : error.message,
    });

    if (status === 500) {
      console.error(error);
    }
  }
});

const shutdown = async () => {
  server.close(async () => {
    if (sql) {
      await sql.end({ timeout: 5 });
    }

    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(port, "0.0.0.0", () => {
  console.log(`duolingo-backend listening on 0.0.0.0:${port}`);
});
