BEGIN;

ALTER TABLE IF EXISTS users
  ALTER COLUMN image_src SET DEFAULT '/Robogo.svg';

ALTER TABLE IF EXISTS user_progress
  ALTER COLUMN user_image_src SET DEFAULT '/Robogo.svg';

UPDATE users
SET image_src = '/Robogo.svg',
    updated_at = NOW()
WHERE image_src IS NULL
   OR BTRIM(image_src) = ''
   OR image_src IN ('/mascot.svg', 'mascot.svg');

UPDATE user_progress
SET user_image_src = '/Robogo.svg'
WHERE user_image_src IS NULL
   OR BTRIM(user_image_src) = ''
   OR user_image_src IN ('/mascot.svg', 'mascot.svg');

COMMIT;
