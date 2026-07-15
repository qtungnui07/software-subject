const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const postgresModule = require("postgres");
const nodemailer = require("nodemailer");
const postgres = postgresModule.default || postgresModule;

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
const frontendInternalUrl = String(
  process.env.FRONTEND_INTERNAL_URL || "http://frontend:3000"
).replace(/\/$/, "");

const sql = databaseUrl ? postgres(databaseUrl, { max: 5 }) : null;
const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const reminderCheckIntervalMs = Math.max(
  30_000,
  Number(process.env.EMAIL_REMINDER_CHECK_INTERVAL_MS || 60_000)
);
const appUrl = String(process.env.APP_URL || "https://robogo.qtitpc.dev").replace(/\/$/, "");
const mailFrom = process.env.MAIL_FROM || "Robogo <noreply@qtitpc.dev>";

const mailTransport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || "false") === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    })
  : null;

let studyTimeSchemaReady = false;
let reminderSchemaReady = false;
let reminderCheckRunning = false;

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

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        reject(Object.assign(new Error("Payload too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });

const proxyFrontendApi = async (req, res, url) => {
  const targetPath = url.pathname.slice("/frontend-api".length) + url.search;
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers["content-length"];

  const response = await fetch(`${frontendInternalUrl}${targetPath}`, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });
  const responseBody = Buffer.from(await response.arrayBuffer());
  const responseHeaders = Object.fromEntries(response.headers.entries());
  responseHeaders["content-length"] = String(responseBody.length);
  res.writeHead(response.status, responseHeaders);
  res.end(responseBody);
};

const requireDatabase = () => {
  if (!sql) {
    throw new Error("DATABASE_URL is not set");
  }
};

const ensureStudyTimeSchema = async () => {
  requireDatabase();

  if (studyTimeSchemaReady) {
    return;
  }

  await sql`
    create table if not exists study_time_summary (
      user_id text primary key,
      total_seconds integer not null default 0,
      today_seconds integer not null default 0,
      current_day date not null default ((now() at time zone 'Asia/Ho_Chi_Minh')::date),
      daily_goal_seconds integer not null default 3600,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`
    create index if not exists study_time_summary_current_day_idx
    on study_time_summary (current_day)
  `;

  studyTimeSchemaReady = true;
};

const ensureReminderSchema = async () => {
  requireDatabase();

  if (reminderSchemaReady) return;

  await sql`
    create table if not exists email_reminder_settings (
      user_id text primary key,
      enabled boolean not null default false,
      reminder_time time not null default '19:00',
      last_sent_date date,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;
  reminderSchemaReady = true;
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

const formatDateInTimeZone = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format date key");
  }

  return `${year}-${month}-${day}`;
};

const getCurrentDateKeys = () => {
  const todayKey = formatDateInTimeZone(new Date(), VIETNAM_TIME_ZONE);
  const [year, month, day] = todayKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const dayIndex = utcDate.getUTCDay();
  const distanceFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;

  utcDate.setUTCDate(utcDate.getUTCDate() - distanceFromMonday);

  return {
    todayKey,
    weekStartKey: utcDate.toISOString().slice(0, 10),
  };
};

const ensureAccountData = async (database, { userId, name, imageSrc }) => {
  const { todayKey, weekStartKey } = getCurrentDateKeys();

  await database`
    insert into user_progress (user_id, user_name, user_image_src)
    values (${userId}, ${name || "User"}, ${imageSrc || "/mascot.svg"})
    on conflict (user_id) do update set
      user_name = excluded.user_name,
      user_image_src = excluded.user_image_src
  `;

  await database`
    insert into user_xp_summary (user_id, total_xp, daily_xp, weekly_xp, current_day, current_week_start, updated_at)
    values (${userId}, 0, 0, 0, ${todayKey}, ${weekStartKey}, now())
    on conflict (user_id) do nothing
  `;

  await database`
    insert into study_time_summary (user_id, current_day, updated_at)
    values (${userId}, ${todayKey}, now())
    on conflict (user_id) do nothing
  `;

  await database`
    insert into chapter_one_progress (user_id, completed_lessons, claimed_chests, completed_checkpoint, updated_at)
    values (${userId}, '[]', '[]', 0, now())
    on conflict (user_id) do nothing
  `;
};

const createLocalUser = async (payload) => {
  requireDatabase();
  await ensureStudyTimeSchema();

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
    const user = await sql.begin(async (transaction) => {
      const [created] = await transaction`
        insert into users (name, email, password_hash, image_src, updated_at)
        values (${name}, ${email}, ${hashPassword(password)}, '/mascot.svg', now())
        returning id, email, name, image_src
      `;

      await ensureAccountData(transaction, {
        userId: String(created.id),
        name: created.name,
        imageSrc: created.image_src,
      });

      return created;
    });

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
  await ensureStudyTimeSchema();

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

  await ensureAccountData(sql, {
    userId: String(user.id),
    name: user.name,
    imageSrc: user.image_src,
  });

  return publicUser(user);
};

const syncUser = async (payload) => {
  requireDatabase();
  await ensureStudyTimeSchema();

  const clerkUserId = String(payload.clerkUserId || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const name = String(payload.name || "User").trim() || "User";
  const imageSrc = String(payload.imageSrc || "/mascot.svg").trim() || "/mascot.svg";

  if (!clerkUserId || !email) {
    const error = new Error("clerkUserId and email are required");
    error.status = 400;
    throw error;
  }

  return sql.begin(async (transaction) => {
    const [existingByClerkId] = await transaction`
      select id
      from users
      where clerk_user_id = ${clerkUserId}
      limit 1
    `;

    if (existingByClerkId) {
      const [user] = await transaction`
        update users
        set
          name = ${name},
          email = ${email},
          updated_at = now()
        where clerk_user_id = ${clerkUserId}
        returning id, clerk_user_id, email, name, image_src, created_at, updated_at
      `;

      await ensureAccountData(transaction, {
        userId: clerkUserId,
        name: user.name,
        imageSrc: user.image_src,
      });

      return user;
    }

    const [existingByEmail] = await transaction`
      select id
      from users
      where email = ${email}
      limit 1
    `;

    if (existingByEmail) {
      const [user] = await transaction`
        update users
        set
          clerk_user_id = ${clerkUserId},
          name = ${name},
          updated_at = now()
        where email = ${email}
        returning id, clerk_user_id, email, name, image_src, created_at, updated_at
      `;

      await ensureAccountData(transaction, {
        userId: clerkUserId,
        name: user.name,
        imageSrc: user.image_src,
      });

      return user;
    }

    const [user] = await transaction`
      insert into users (clerk_user_id, name, email, image_src, updated_at)
      values (${clerkUserId}, ${name}, ${email}, ${imageSrc}, now())
      returning id, clerk_user_id, email, name, image_src, created_at, updated_at
    `;

    await ensureAccountData(transaction, {
      userId: clerkUserId,
      name: user.name,
      imageSrc: user.image_src,
    });

    return user;
  });
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
  imageSrc: user.image_src || "/mascot.svg",
  isClerk: Boolean(user.clerk_user_id),
});

const normalizeStudyTimeSummary = (row) => ({
  userId: row.user_id,
  totalSeconds: Number(row.total_seconds || 0),
  todaySeconds: Number(row.today_seconds || 0),
  dailyGoalSeconds: Number(row.daily_goal_seconds || 3600),
  currentDay: row.current_day,
  updatedAt: row.updated_at,
});

const getStudyTimeSummary = async (userId, database = sql) => {
  await ensureStudyTimeSchema();
  await findAccount(userId, database);

  const todayExpression = database`(now() at time zone ${VIETNAM_TIME_ZONE})::date`;
  const [summary] = await database`
    insert into study_time_summary (user_id, current_day, updated_at)
    values (${userId}, ${todayExpression}, now())
    on conflict (user_id) do update set
      today_seconds = case
        when study_time_summary.current_day = ${todayExpression}
          then study_time_summary.today_seconds
        else 0
      end,
      current_day = ${todayExpression},
      updated_at = now()
    returning user_id, total_seconds, today_seconds, daily_goal_seconds, current_day, updated_at
  `;

  return normalizeStudyTimeSummary(summary);
};

const recordStudyTime = async (userId, payload) => {
  requireDatabase();
  await ensureStudyTimeSchema();

  const durationSeconds = Math.trunc(Number(payload.durationSeconds || 0));

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    const error = new Error("durationSeconds must be a positive number");
    error.status = 400;
    throw error;
  }

  if (durationSeconds > 60 * 60) {
    const error = new Error("durationSeconds is too large");
    error.status = 400;
    throw error;
  }

  return sql.begin(async (transaction) => {
    await findAccount(userId, transaction);

    const todayExpression = transaction`(now() at time zone ${VIETNAM_TIME_ZONE})::date`;
    const [summary] = await transaction`
      insert into study_time_summary (
        user_id,
        total_seconds,
        today_seconds,
        current_day,
        updated_at
      )
      values (${userId}, ${durationSeconds}, ${durationSeconds}, ${todayExpression}, now())
      on conflict (user_id) do update set
        total_seconds = study_time_summary.total_seconds + ${durationSeconds},
        today_seconds = case
          when study_time_summary.current_day = ${todayExpression}
            then study_time_summary.today_seconds + ${durationSeconds}
          else ${durationSeconds}
        end,
        current_day = ${todayExpression},
        updated_at = now()
      returning user_id, total_seconds, today_seconds, daily_goal_seconds, current_day, updated_at
    `;

    return normalizeStudyTimeSummary(summary);
  });
};

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
            returning id, clerk_user_id, name, email, image_src
          `
        : await transaction`
            update users
            set name = ${name}, email = ${email}, updated_at = now()
            where id = ${Number(userId)}
            returning id, clerk_user_id, name, email, image_src
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

const normalizeReminder = (row) => ({
  enabled: Boolean(row.enabled),
  reminderTime: String(row.reminder_time || "19:00").slice(0, 5),
  timeZone: VIETNAM_TIME_ZONE,
});

const getEmailReminder = async (userId) => {
  await ensureReminderSchema();
  await findAccount(userId);
  const [setting] = await sql`
    insert into email_reminder_settings (user_id)
    values (${userId})
    on conflict (user_id) do update set user_id = excluded.user_id
    returning enabled, reminder_time
  `;
  return normalizeReminder(setting);
};

const updateEmailReminder = async (userId, payload) => {
  await ensureReminderSchema();
  await findAccount(userId);
  const enabled = payload.enabled;
  const reminderTime = String(payload.reminderTime || "");

  if (typeof enabled !== "boolean" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(reminderTime)) {
    const error = new Error("enabled and a valid reminderTime (HH:mm) are required");
    error.status = 400;
    throw error;
  }

  const [setting] = await sql`
    insert into email_reminder_settings (user_id, enabled, reminder_time, updated_at)
    values (${userId}, ${enabled}, ${reminderTime}, now())
    on conflict (user_id) do update set
      enabled = excluded.enabled,
      reminder_time = excluded.reminder_time,
      updated_at = now()
    returning enabled, reminder_time
  `;
  return normalizeReminder(setting);
};

const escapeHtml = (value) =>
  String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sendStudyReminders = async () => {
  if (!sql || !mailTransport || reminderCheckRunning) return;
  reminderCheckRunning = true;

  try {
    await ensureStudyTimeSchema();
    await ensureReminderSchema();
    const recipients = await sql`
      select
        settings.user_id,
        users.email,
        users.name,
        coalesce(summary.today_seconds, 0)::int as today_seconds,
        coalesce(summary.daily_goal_seconds, 3600)::int as daily_goal_seconds
      from email_reminder_settings settings
      join users on coalesce(users.clerk_user_id, users.id::text) = settings.user_id
      left join study_time_summary summary on summary.user_id = settings.user_id
      where settings.enabled = true
        and to_char(now() at time zone ${VIETNAM_TIME_ZONE}, 'HH24:MI') = to_char(settings.reminder_time, 'HH24:MI')
        and settings.last_sent_date is distinct from (now() at time zone ${VIETNAM_TIME_ZONE})::date
        and (
          summary.user_id is null
          or summary.current_day <> (now() at time zone ${VIETNAM_TIME_ZONE})::date
          or summary.today_seconds < summary.daily_goal_seconds
        )
    `;
    const reminderDate = formatDateInTimeZone(new Date(), VIETNAM_TIME_ZONE);

    for (const recipient of recipients) {
      const studiedMinutes = Math.floor(Number(recipient.today_seconds) / 60);
      const goalMinutes = Math.ceil(Number(recipient.daily_goal_seconds) / 60);
      await mailTransport.sendMail({
        from: mailFrom,
        to: recipient.email,
        subject: "Đến giờ học cùng Robogo rồi!",
        headers: {
          "Resend-Idempotency-Key": `study-reminder/${reminderDate}/${crypto
            .createHash("sha256")
            .update(String(recipient.user_id))
            .digest("hex")
            .slice(0, 24)}`,
        },
        text: `Chào ${recipient.name}, hôm nay bạn đã học ${studiedMinutes}/${goalMinutes} phút. Vào Robogo để hoàn thành mục tiêu nhé: ${appUrl}/learn`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#243746"><h1 style="color:#1486cc">Đến giờ học rồi!</h1><p>Chào <strong>${escapeHtml(recipient.name)}</strong>,</p><p>Hôm nay bạn đã học <strong>${studiedMinutes}/${goalMinutes} phút</strong>. Chỉ một bài học ngắn nữa để tiến gần mục tiêu hơn.</p><p><a href="${appUrl}/learn" style="display:inline-block;background:#1486cc;color:#fff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:700">Học ngay với Robogo</a></p><p style="font-size:12px;color:#718096">Bạn có thể đổi giờ hoặc tắt email này trong Cài đặt riêng.</p></div>`,
      });
      await sql`
        update email_reminder_settings
        set last_sent_date = (now() at time zone ${VIETNAM_TIME_ZONE})::date, updated_at = now()
        where user_id = ${recipient.user_id}
      `;
      console.log(`${new Date().toISOString()} study reminder sent user_id=${recipient.user_id}`);
    }
  } catch (error) {
    console.error("Study reminder check failed", error);
  } finally {
    reminderCheckRunning = false;
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

  await sql.begin(async (transaction) => {
    const existing = await findAccount(userId, transaction);

    if (existing.clerk_user_id) {
      await transaction`
        update users
        set name = ${name}, image_src = ${imageSrc}, updated_at = now()
        where clerk_user_id = ${userId}
      `;
    } else {
      await transaction`
        update users
        set name = ${name}, image_src = ${imageSrc}, updated_at = now()
        where id = ${Number(userId)}
      `;
    }

    await transaction`
      insert into user_progress (user_id, user_name, user_image_src)
      values (${userId}, ${name}, ${imageSrc})
      on conflict (user_id) do update set
        user_name = excluded.user_name,
        user_image_src = excluded.user_image_src
    `;
  });

  return getProfile(userId);
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (url.pathname.startsWith("/frontend-api/api/")) {
      await proxyFrontendApi(req, res, url);
      logRequest(req, 200, "proxied_to=frontend");
      return;
    }

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

    if (req.method === "GET" && url.pathname === "/settings/email-reminder") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const reminder = await getEmailReminder(userId);
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, reminder });
      return;
    }

    if (req.method === "PATCH" && url.pathname === "/settings/email-reminder") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const reminder = await updateEmailReminder(userId, await readJson(req));
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, reminder });
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

    if (req.method === "GET" && url.pathname === "/study-time") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const summary = await getStudyTimeSummary(userId);
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, summary });
      return;
    }

    if (req.method === "POST" && url.pathname === "/study-time/track") {
      requireApiKey(req);
      const userId = requireUserId(req);
      const summary = await recordStudyTime(userId, await readJson(req));
      logRequest(req, 200, `user_id=${userId}`);
      sendJson(res, 200, { ok: true, summary });
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
  if (mailTransport) {
    console.log(`study email reminders enabled from=${mailFrom}`);
    void sendStudyReminders();
    setInterval(sendStudyReminders, reminderCheckIntervalMs).unref();
  } else {
    console.log("study email reminders disabled: SMTP_HOST is not set");
  }
});
