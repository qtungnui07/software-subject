ALTER TABLE learning_nodes
ADD COLUMN IF NOT EXISTS pass_threshold INTEGER
CHECK (pass_threshold IS NULL OR pass_threshold BETWEEN 1 AND 100);

ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS assessment_payload JSONB;

ALTER TABLE exercises
DROP CONSTRAINT IF EXISTS exercises_exercise_type_check;

ALTER TABLE exercises
ADD CONSTRAINT exercises_exercise_type_check
CHECK (
  exercise_type IN (
    'multiple_choice',
    'arrange_words',
    'fill_blank',
    'dialogue_choice',
    'listening_choice',
    'match_pairs',
    'arrange_dialogue',
    'sentence_rewrite',
    'short_writing'
  )
);

ALTER TABLE exercises
DROP CONSTRAINT IF EXISTS exercises_skill_check;

ALTER TABLE exercises
ADD CONSTRAINT exercises_skill_check
CHECK (
  skill IN ('vocabulary', 'grammar', 'listening', 'reading', 'conversation')
);

ALTER TABLE placement_questions
DROP CONSTRAINT IF EXISTS placement_questions_exercise_type_check;

ALTER TABLE placement_questions
ADD CONSTRAINT placement_questions_exercise_type_check
CHECK (
  exercise_type IN (
    'multiple_choice',
    'arrange_words',
    'fill_blank',
    'dialogue_choice',
    'listening_choice'
  )
);

ALTER TABLE placement_questions
DROP CONSTRAINT IF EXISTS placement_questions_skill_check;

ALTER TABLE placement_questions
ADD CONSTRAINT placement_questions_skill_check
CHECK (
  skill IN ('vocabulary', 'grammar', 'listening', 'reading', 'conversation')
);

ALTER TABLE quest_definitions
DROP CONSTRAINT IF EXISTS quest_definitions_quest_type_check;

ALTER TABLE quest_definitions
ADD CONSTRAINT quest_definitions_quest_type_check
CHECK (quest_type IN ('daily', 'perfect-day', 'weekly', 'monthly'));
