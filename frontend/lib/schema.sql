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
  study_minutes      INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE daily_streak_logs
ADD COLUMN IF NOT EXISTS study_minutes INTEGER NOT NULL DEFAULT 0;

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


CREATE TABLE IF NOT EXISTS chapter_one_progress (
  user_id               TEXT PRIMARY KEY,
  completed_lessons     TEXT NOT NULL DEFAULT '[]',
  claimed_chests        TEXT NOT NULL DEFAULT '[]',
  completed_checkpoint  INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quest_daily_stats (
  id                 SERIAL PRIMARY KEY,
  user_id            TEXT NOT NULL,
  stat_date          DATE NOT NULL,
  lessons_completed  INTEGER NOT NULL DEFAULT 0,
  xp_earned          INTEGER NOT NULL DEFAULT 0,
  minutes_learned    INTEGER NOT NULL DEFAULT 0,
  best_accuracy      INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS quest_daily_stats_user_date_idx
ON quest_daily_stats (user_id, stat_date);

CREATE INDEX IF NOT EXISTS quest_daily_stats_user_idx
ON quest_daily_stats (user_id);

CREATE TABLE IF NOT EXISTS quest_reward_claims (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT NOT NULL,
  quest_id     TEXT NOT NULL,
  claim_date   DATE NOT NULL,
  reward_type  TEXT NOT NULL DEFAULT 'quest',
  reward_xp    INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS quest_reward_claims_user_quest_date_idx
ON quest_reward_claims (user_id, quest_id, claim_date);

CREATE INDEX IF NOT EXISTS quest_reward_claims_user_date_idx
ON quest_reward_claims (user_id, claim_date);

CREATE TABLE IF NOT EXISTS course_progress (
  id                       SERIAL PRIMARY KEY,
  user_id                  TEXT NOT NULL,
  course_id                TEXT NOT NULL,
  current_section_id       TEXT NOT NULL DEFAULT 'english-section-1',
  unlocked_section_ids     TEXT NOT NULL DEFAULT '["english-section-1"]',
  completed_node_ids       TEXT NOT NULL DEFAULT '[]',
  claimed_reward_node_ids  TEXT NOT NULL DEFAULT '[]',
  checkpoint_scores        TEXT NOT NULL DEFAULT '{}',
  onboarding_status        TEXT,
  onboarding_choice        TEXT,
  onboarding_completed_at  TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS course_progress_user_course_idx
ON course_progress (user_id, course_id);

CREATE INDEX IF NOT EXISTS course_progress_user_idx
ON course_progress (user_id);

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS course_id TEXT NOT NULL DEFAULT 'english';

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS current_section_id TEXT NOT NULL DEFAULT 'english-section-1';

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS unlocked_section_ids TEXT NOT NULL DEFAULT '["english-section-1"]';

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS completed_node_ids TEXT NOT NULL DEFAULT '[]';

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS claimed_reward_node_ids TEXT NOT NULL DEFAULT '[]';

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS checkpoint_scores TEXT NOT NULL DEFAULT '{}';

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS onboarding_status TEXT;

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS onboarding_choice TEXT;

ALTER TABLE course_progress
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS placement_test_results (
  id                           SERIAL PRIMARY KEY,
  user_id                      TEXT NOT NULL,
  course_id                    TEXT NOT NULL DEFAULT 'english',
  test_version                 TEXT NOT NULL,
  total_correct                INTEGER NOT NULL DEFAULT 0,
  basic_score                  INTEGER NOT NULL DEFAULT 0,
  intermediate_score           INTEGER NOT NULL DEFAULT 0,
  advanced_score               INTEGER NOT NULL DEFAULT 0,
  latest_assigned_section_id   TEXT NOT NULL DEFAULT 'english-section-1',
  highest_assigned_section_id  TEXT NOT NULL DEFAULT 'english-section-1',
  answers_json                 TEXT NOT NULL DEFAULT '[]',
  attempt_count                INTEGER NOT NULL DEFAULT 1,
  duration_seconds             INTEGER,
  started_at                   TIMESTAMPTZ,
  completed_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_submission_id           TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS placement_test_results_user_course_idx
ON placement_test_results (user_id, course_id);

CREATE INDEX IF NOT EXISTS placement_test_results_user_idx
ON placement_test_results (user_id);

ALTER TABLE placement_test_results
ADD COLUMN IF NOT EXISTS last_submission_id TEXT;

CREATE TABLE IF NOT EXISTS learning_sync_jobs (
  id               SERIAL PRIMARY KEY,
  user_id          TEXT NOT NULL,
  node_id          TEXT NOT NULL,
  system           TEXT NOT NULL CHECK (system IN ('xp', 'quest', 'streak')),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts         INTEGER NOT NULL DEFAULT 0,
  next_retry_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload_json     TEXT NOT NULL DEFAULT '{}',
  last_error_code  TEXT,
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS learning_sync_jobs_user_node_system_idx
ON learning_sync_jobs (user_id, node_id, system);
CREATE INDEX IF NOT EXISTS learning_sync_jobs_status_retry_idx
ON learning_sync_jobs (status, next_retry_at);
CREATE INDEX IF NOT EXISTS learning_sync_jobs_user_idx
ON learning_sync_jobs (user_id);

CREATE TABLE IF NOT EXISTS adaptive_rate_limits (
  id               TEXT PRIMARY KEY,
  scope            TEXT NOT NULL,
  identifier_hash  TEXT NOT NULL,
  window_start     TIMESTAMPTZ NOT NULL,
  request_count    INTEGER NOT NULL DEFAULT 0,
  expires_at       TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS adaptive_rate_limits_scope_identifier_window_idx
ON adaptive_rate_limits (scope, identifier_hash, window_start);
CREATE INDEX IF NOT EXISTS adaptive_rate_limits_expires_at_idx
ON adaptive_rate_limits (expires_at);
