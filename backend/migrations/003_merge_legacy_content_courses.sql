DO $$
DECLARE
  canonical_id INTEGER;
  duplicate_id INTEGER;
BEGIN
  SELECT id
  INTO canonical_id
  FROM courses
  WHERE title = 'Tiếng Anh' AND content_id IS NULL
  ORDER BY id
  LIMIT 1;

  SELECT id
  INTO duplicate_id
  FROM courses
  WHERE content_id = 'english'
  ORDER BY id
  LIMIT 1;

  IF canonical_id IS NOT NULL AND duplicate_id IS NOT NULL THEN
    IF to_regclass('public.user_progress') IS NOT NULL THEN
      UPDATE user_progress
      SET active_course_id = canonical_id
      WHERE active_course_id = duplicate_id;
    END IF;

    UPDATE courses AS canonical
    SET legacy_ids = duplicate.legacy_ids,
        language_code = duplicate.language_code,
        content_status = duplicate.content_status,
        content_release_id = duplicate.content_release_id,
        "imageSrc" = duplicate."imageSrc"
    FROM courses AS duplicate
    WHERE canonical.id = canonical_id
      AND duplicate.id = duplicate_id;

    DELETE FROM courses WHERE id = duplicate_id;

    UPDATE courses
    SET content_id = 'english'
    WHERE id = canonical_id;
  END IF;
END $$;
