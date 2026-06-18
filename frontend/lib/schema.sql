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
