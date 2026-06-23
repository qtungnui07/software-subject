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
