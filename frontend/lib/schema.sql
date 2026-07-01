CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  clerk_user_id  TEXT UNIQUE,
  name           TEXT NOT NULL DEFAULT 'User',
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT,
  image_src      TEXT NOT NULL DEFAULT '/mascot.svg',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id          TEXT PRIMARY KEY,
  current_streak   INTEGER NOT NULL DEFAULT 0,
  longest_streak   INTEGER NOT NULL DEFAULT 0,
  streak_freezes   INTEGER NOT NULL DEFAULT 0,
  last_study_date  DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_streak_logs (
  id                 SERIAL PRIMARY KEY,
  user_id            TEXT NOT NULL,
  study_date         DATE NOT NULL,
  completed_lessons  INTEGER NOT NULL DEFAULT 0,
  earned_xp          INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_streak_logs_user_date_idx
ON daily_streak_logs (user_id, study_date);

CREATE TABLE IF NOT EXISTS user_xp_summary (
  user_id             TEXT PRIMARY KEY,
  total_xp            INTEGER NOT NULL DEFAULT 0,
  daily_xp            INTEGER NOT NULL DEFAULT 0,
  weekly_xp           INTEGER NOT NULL DEFAULT 0,
  current_day         DATE,
  current_week_start  DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS study_time_summary (
  user_id             TEXT PRIMARY KEY,
  total_seconds       INTEGER NOT NULL DEFAULT 0,
  today_seconds       INTEGER NOT NULL DEFAULT 0,
  current_day         DATE NOT NULL DEFAULT ((NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE),
  daily_goal_seconds  INTEGER NOT NULL DEFAULT 3600,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS study_time_summary_current_day_idx
ON study_time_summary (current_day);

CREATE TABLE IF NOT EXISTS xp_events (
  id              SERIAL PRIMARY KEY,
  user_id         TEXT NOT NULL,
  lesson_id       TEXT NOT NULL,
  earned_xp       INTEGER NOT NULL DEFAULT 0,
  base_xp         INTEGER NOT NULL DEFAULT 0,
  accuracy_bonus  INTEGER NOT NULL DEFAULT 0,
  accuracy        INTEGER NOT NULL DEFAULT 0,
  reward_type     TEXT NOT NULL,
  event_date      DATE NOT NULL,
  week_start      DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS xp_events_user_created_at_idx
ON xp_events (user_id, created_at);

CREATE INDEX IF NOT EXISTS xp_events_user_lesson_idx
ON xp_events (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS xp_events_week_start_idx
ON xp_events (week_start);

CREATE TABLE IF NOT EXISTS lesson_xp_claims (
  id                  SERIAL PRIMARY KEY,
  user_id             TEXT NOT NULL,
  lesson_id           TEXT NOT NULL,
  earned_xp           INTEGER NOT NULL DEFAULT 0,
  accuracy            INTEGER NOT NULL DEFAULT 0,
  first_completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS lesson_xp_claims_user_lesson_idx
ON lesson_xp_claims (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS lesson_xp_claims_user_idx
ON lesson_xp_claims (user_id);
