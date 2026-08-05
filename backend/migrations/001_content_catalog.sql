CREATE TABLE IF NOT EXISTS content_releases (
  id            TEXT PRIMARY KEY,
  version       INTEGER NOT NULL CHECK (version > 0),
  status        TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS content_releases_one_published_idx
ON content_releases (status)
WHERE status = 'published';

CREATE TABLE IF NOT EXISTS courses (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  "imageSrc"  TEXT NOT NULL
);

ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_id TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS legacy_ids JSONB NOT NULL DEFAULT '[]'::JSONB;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language_code TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_status TEXT NOT NULL DEFAULT 'ready';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_release_id TEXT REFERENCES content_releases(id);
CREATE UNIQUE INDEX IF NOT EXISTS courses_content_id_idx ON courses (content_id);

CREATE TABLE IF NOT EXISTS course_sections (
  id                  TEXT PRIMARY KEY,
  course_content_id   TEXT NOT NULL,
  content_release_id  TEXT NOT NULL REFERENCES content_releases(id),
  sort_order          INTEGER NOT NULL,
  level               TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  content_status      TEXT NOT NULL CHECK (content_status IN ('ready', 'placeholder')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_content_id, sort_order)
);

CREATE INDEX IF NOT EXISTS course_sections_course_idx
ON course_sections (course_content_id, sort_order);

CREATE TABLE IF NOT EXISTS course_chapters (
  id                  TEXT PRIMARY KEY,
  section_id          TEXT NOT NULL REFERENCES course_sections(id) ON DELETE RESTRICT,
  content_release_id  TEXT NOT NULL REFERENCES content_releases(id),
  sort_order          INTEGER NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (section_id, sort_order)
);

CREATE TABLE IF NOT EXISTS learning_nodes (
  id                    TEXT PRIMARY KEY,
  chapter_id            TEXT NOT NULL REFERENCES course_chapters(id) ON DELETE RESTRICT,
  content_release_id    TEXT NOT NULL REFERENCES content_releases(id),
  legacy_id             INTEGER,
  node_type              TEXT NOT NULL CHECK (node_type IN ('lesson', 'chest', 'checkpoint')),
  title                  TEXT NOT NULL,
  short_title            TEXT NOT NULL,
  description            TEXT NOT NULL,
  sort_order              INTEGER NOT NULL,
  unlock_after_id         TEXT,
  href                    TEXT,
  xp                      INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  counts_toward_progress  BOOLEAN NOT NULL DEFAULT TRUE,
  content_status          TEXT NOT NULL CHECK (content_status IN ('ready', 'placeholder')),
  rewards                 JSONB NOT NULL DEFAULT '[]'::JSONB,
  roadmap_position        JSONB,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (chapter_id, sort_order)
);

CREATE INDEX IF NOT EXISTS learning_nodes_chapter_idx
ON learning_nodes (chapter_id, sort_order);
CREATE INDEX IF NOT EXISTS learning_nodes_unlock_after_idx
ON learning_nodes (unlock_after_id);

CREATE TABLE IF NOT EXISTS lesson_details (
  node_id             TEXT PRIMARY KEY REFERENCES learning_nodes(id) ON DELETE RESTRICT,
  content_release_id  TEXT NOT NULL REFERENCES content_releases(id),
  overview            TEXT NOT NULL,
  objectives          JSONB NOT NULL DEFAULT '[]'::JSONB,
  focus_skills        JSONB NOT NULL DEFAULT '[]'::JSONB,
  estimated_minutes   INTEGER NOT NULL CHECK (estimated_minutes > 0),
  checkpoint_unlocks  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id                  TEXT PRIMARY KEY,
  node_id             TEXT NOT NULL REFERENCES learning_nodes(id) ON DELETE RESTRICT,
  content_release_id  TEXT NOT NULL REFERENCES content_releases(id),
  sort_order          INTEGER NOT NULL,
  exercise_type       TEXT NOT NULL,
  skill               TEXT NOT NULL,
  difficulty          INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  instruction         TEXT NOT NULL,
  prompt              TEXT NOT NULL,
  explanation         TEXT,
  hint                TEXT,
  context_payload     JSONB,
  public_payload      JSONB NOT NULL DEFAULT '{}'::JSONB,
  answer_payload      JSONB NOT NULL DEFAULT '{}'::JSONB,
  content_version     INTEGER NOT NULL DEFAULT 1 CHECK (content_version > 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (node_id, sort_order)
);

CREATE INDEX IF NOT EXISTS exercises_node_idx ON exercises (node_id, sort_order);

CREATE TABLE IF NOT EXISTS placement_tests (
  id                  TEXT PRIMARY KEY,
  course_content_id   TEXT NOT NULL,
  test_version        TEXT NOT NULL UNIQUE,
  content_release_id  TEXT NOT NULL REFERENCES content_releases(id),
  status              TEXT NOT NULL DEFAULT 'published'
                      CHECK (status IN ('draft', 'published', 'archived')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS placement_questions (
  id                  TEXT PRIMARY KEY,
  test_id             TEXT NOT NULL REFERENCES placement_tests(id) ON DELETE RESTRICT,
  content_release_id  TEXT NOT NULL REFERENCES content_releases(id),
  band                INTEGER NOT NULL CHECK (band BETWEEN 1 AND 3),
  sort_order          INTEGER NOT NULL,
  exercise_type       TEXT NOT NULL,
  skill               TEXT NOT NULL,
  difficulty          INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  instruction         TEXT NOT NULL,
  prompt              TEXT NOT NULL,
  public_payload      JSONB NOT NULL DEFAULT '{}'::JSONB,
  answer_payload      JSONB NOT NULL DEFAULT '{}'::JSONB,
  explanation         TEXT,
  UNIQUE (test_id, sort_order)
);

CREATE TABLE IF NOT EXISTS quest_definitions (
  id                  TEXT PRIMARY KEY,
  content_release_id  TEXT NOT NULL REFERENCES content_releases(id),
  quest_type          TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  metric              TEXT NOT NULL,
  target_value        INTEGER NOT NULL CHECK (target_value > 0),
  reward_payload      JSONB NOT NULL,
  icon                TEXT NOT NULL,
  sort_order          INTEGER NOT NULL,
  is_preview          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quest_definitions_type_order_idx
ON quest_definitions (quest_type, sort_order);
