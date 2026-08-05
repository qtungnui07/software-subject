const fs = require("fs");
const path = require("path");
const postgresModule = require("postgres");
const postgres = postgresModule.default || postgresModule;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const datasetPath = path.resolve(__dirname, "..", "data", "content-v1.json");
const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
const sql = postgres(databaseUrl, { max: 1 });

const ANSWER_KEYS = new Set([
  "correctOptionId",
  "correctOrder",
  "acceptedAnswers",
  "caseSensitive",
  "correctPairs",
  "sampleAnswer",
  "requiredPhraseOrder",
  "requiredContentGroups",
]);
const BASE_KEYS = new Set([
  "id",
  "lessonId",
  "type",
  "instruction",
  "prompt",
  "skill",
  "difficulty",
  "explanation",
  "hint",
  "context",
  "contentVersion",
]);

const splitExercise = (exercise) => {
  const publicPayload = {};
  const answerPayload = {};
  for (const [key, value] of Object.entries(exercise)) {
    if (BASE_KEYS.has(key)) continue;
    (ANSWER_KEYS.has(key) ? answerPayload : publicPayload)[key] = value;
  }
  return { publicPayload, answerPayload };
};

const run = async () => {
  const release = dataset.release;
  await sql.begin(async (tx) => {
    await tx`
      insert into content_releases (id, version, status, published_at, updated_at)
      values (
        ${release.id},
        ${release.version},
        ${release.status},
        ${release.status === "published" ? new Date() : null},
        now()
      )
      on conflict (id) do update set
        version = excluded.version,
        status = excluded.status,
        published_at = coalesce(content_releases.published_at, excluded.published_at),
        updated_at = now()
    `;

    for (const course of dataset.courses) {
      await tx`
        update courses
        set content_id = ${course.id}
        where id = (
          select id
          from courses
          where content_id is null and title = ${course.title}
          order by id
          limit 1
        )
        and not exists (
          select 1 from courses where content_id = ${course.id}
        )
      `;
      await tx`
        insert into courses (
          title, "imageSrc", content_id, legacy_ids, language_code,
          content_status, content_release_id
        )
        values (
          ${course.title}, ${course.imageSrc}, ${course.id},
          ${tx.json(course.legacyIds || [])}, ${course.languageCode},
          'ready', ${release.id}
        )
        on conflict (content_id) do update set
          title = excluded.title,
          "imageSrc" = excluded."imageSrc",
          legacy_ids = excluded.legacy_ids,
          language_code = excluded.language_code,
          content_status = excluded.content_status,
          content_release_id = excluded.content_release_id
      `;

      for (const section of course.sections) {
        await tx`
          insert into course_sections (
            id, course_content_id, content_release_id, sort_order, level,
            title, description, content_status, updated_at
          )
          values (
            ${section.id}, ${course.id}, ${release.id}, ${section.order},
            ${section.level}, ${section.title}, ${section.description},
            ${section.contentStatus}, now()
          )
          on conflict (id) do update set
            course_content_id = excluded.course_content_id,
            content_release_id = excluded.content_release_id,
            sort_order = excluded.sort_order,
            level = excluded.level,
            title = excluded.title,
            description = excluded.description,
            content_status = excluded.content_status,
            updated_at = now()
        `;

        const chapter = section.chapter;
        await tx`
          insert into course_chapters (
            id, section_id, content_release_id, sort_order, title,
            description, updated_at
          )
          values (
            ${chapter.id}, ${section.id}, ${release.id}, ${chapter.order},
            ${chapter.title}, ${chapter.description}, now()
          )
          on conflict (id) do update set
            section_id = excluded.section_id,
            content_release_id = excluded.content_release_id,
            sort_order = excluded.sort_order,
            title = excluded.title,
            description = excluded.description,
            updated_at = now()
        `;

        for (const node of chapter.nodes) {
          const checkpointConfig = dataset.checkpointConfigs?.[node.id] ?? null;
          await tx`
            insert into learning_nodes (
              id, chapter_id, content_release_id, legacy_id, node_type,
              title, short_title, description, sort_order, unlock_after_id,
              href, xp, counts_toward_progress, content_status, rewards,
              roadmap_position, pass_threshold, updated_at
            )
            values (
              ${node.id}, ${chapter.id}, ${release.id}, ${node.legacyId ?? null},
              ${node.type}, ${node.title}, ${node.shortTitle}, ${node.description},
              ${node.order}, ${node.unlockAfterId}, ${node.href}, ${node.xp},
              ${node.countsTowardProgress}, ${node.contentStatus},
              ${tx.json(node.rewards || [])},
              ${node.roadmapPosition ? tx.json(node.roadmapPosition) : null},
              ${checkpointConfig?.passThreshold ?? null},
              now()
            )
            on conflict (id) do update set
              chapter_id = excluded.chapter_id,
              content_release_id = excluded.content_release_id,
              legacy_id = excluded.legacy_id,
              node_type = excluded.node_type,
              title = excluded.title,
              short_title = excluded.short_title,
              description = excluded.description,
              sort_order = excluded.sort_order,
              unlock_after_id = excluded.unlock_after_id,
              href = excluded.href,
              xp = excluded.xp,
              counts_toward_progress = excluded.counts_toward_progress,
              content_status = excluded.content_status,
              rewards = excluded.rewards,
              roadmap_position = excluded.roadmap_position,
              pass_threshold = excluded.pass_threshold,
              updated_at = now()
          `;
        }
      }
    }

    for (const [nodeId, detail] of Object.entries(dataset.lessonDetails)) {
      await tx`
        insert into lesson_details (
          node_id, content_release_id, overview, objectives, focus_skills,
          estimated_minutes, checkpoint_unlocks, updated_at
        )
        values (
          ${nodeId}, ${release.id}, ${detail.overview},
          ${tx.json(detail.objectives)}, ${tx.json(detail.focusSkills)},
          ${detail.estimatedMinutes}, ${detail.checkpointUnlocks ?? null}, now()
        )
        on conflict (node_id) do update set
          content_release_id = excluded.content_release_id,
          overview = excluded.overview,
          objectives = excluded.objectives,
          focus_skills = excluded.focus_skills,
          estimated_minutes = excluded.estimated_minutes,
          checkpoint_unlocks = excluded.checkpoint_unlocks,
          updated_at = now()
      `;
    }

    for (const [nodeId, exercises] of Object.entries(dataset.exerciseCatalog)) {
      for (const [index, exercise] of exercises.entries()) {
        const { publicPayload, answerPayload } = splitExercise(exercise);
        const assessment =
          dataset.checkpointConfigs?.[nodeId]?.assessments?.find(
            (item) => item.exerciseId === exercise.id,
          ) ?? null;
        await tx`
          insert into exercises (
            id, node_id, content_release_id, sort_order, exercise_type, skill,
            difficulty, instruction, prompt, explanation, hint, context_payload,
            public_payload, answer_payload, assessment_payload,
            content_version, updated_at
          )
          values (
            ${exercise.id}, ${nodeId}, ${release.id}, ${index + 1},
            ${exercise.type}, ${exercise.skill}, ${exercise.difficulty},
            ${exercise.instruction}, ${exercise.prompt},
            ${exercise.explanation ?? null}, ${exercise.hint ?? null},
            ${exercise.context ? tx.json(exercise.context) : null},
            ${tx.json(publicPayload)}, ${tx.json(answerPayload)},
            ${assessment ? tx.json(assessment) : null},
            ${exercise.contentVersion ?? 1}, now()
          )
          on conflict (id) do update set
            node_id = excluded.node_id,
            content_release_id = excluded.content_release_id,
            sort_order = excluded.sort_order,
            exercise_type = excluded.exercise_type,
            skill = excluded.skill,
            difficulty = excluded.difficulty,
            instruction = excluded.instruction,
            prompt = excluded.prompt,
            explanation = excluded.explanation,
            hint = excluded.hint,
            context_payload = excluded.context_payload,
            public_payload = excluded.public_payload,
            answer_payload = excluded.answer_payload,
            assessment_payload = excluded.assessment_payload,
            content_version = excluded.content_version,
            updated_at = now()
        `;
      }
    }

    for (const test of dataset.placementTests) {
      await tx`
        insert into placement_tests (
          id, course_content_id, test_version, content_release_id, status, updated_at
        )
        values (${test.id}, ${test.courseId}, ${test.version}, ${release.id}, 'published', now())
        on conflict (id) do update set
          course_content_id = excluded.course_content_id,
          test_version = excluded.test_version,
          content_release_id = excluded.content_release_id,
          status = excluded.status,
          updated_at = now()
      `;
      for (const question of test.questions) {
        const exercise = question.exercise;
        const { publicPayload, answerPayload } = splitExercise(exercise);
        await tx`
          insert into placement_questions (
            id, test_id, content_release_id, band, sort_order, exercise_type,
            skill, difficulty, instruction, prompt, public_payload,
            answer_payload, explanation
          )
          values (
            ${exercise.id}, ${test.id}, ${release.id}, ${question.band},
            ${question.order}, ${exercise.type}, ${exercise.skill},
            ${exercise.difficulty}, ${exercise.instruction}, ${exercise.prompt},
            ${tx.json(publicPayload)}, ${tx.json(answerPayload)},
            ${exercise.explanation ?? null}
          )
          on conflict (id) do update set
            test_id = excluded.test_id,
            content_release_id = excluded.content_release_id,
            band = excluded.band,
            sort_order = excluded.sort_order,
            exercise_type = excluded.exercise_type,
            skill = excluded.skill,
            difficulty = excluded.difficulty,
            instruction = excluded.instruction,
            prompt = excluded.prompt,
            public_payload = excluded.public_payload,
            answer_payload = excluded.answer_payload,
            explanation = excluded.explanation
        `;
      }
    }

    for (const quest of dataset.questDefinitions) {
      await tx`
        insert into quest_definitions (
          id, content_release_id, quest_type, title, description, metric,
          target_value, reward_payload, icon, sort_order, is_preview, updated_at
        )
        values (
          ${quest.id}, ${release.id}, ${quest.type}, ${quest.title},
          ${quest.description}, ${quest.metric}, ${quest.target},
          ${tx.json(quest.reward)}, ${quest.icon}, ${quest.order},
          ${quest.isPreview ?? false}, now()
        )
        on conflict (id) do update set
          content_release_id = excluded.content_release_id,
          quest_type = excluded.quest_type,
          title = excluded.title,
          description = excluded.description,
          metric = excluded.metric,
          target_value = excluded.target_value,
          reward_payload = excluded.reward_payload,
          icon = excluded.icon,
          sort_order = excluded.sort_order,
          is_preview = excluded.is_preview,
          updated_at = now()
      `;
    }
  });

  const [counts] = await sql`
    select
      (select count(*)::int from learning_nodes) as nodes,
      (select count(*)::int from exercises) as exercises,
      (select count(*)::int from placement_questions) as placement_questions,
      (select count(*)::int from quest_definitions) as quests
  `;
  console.log("Content seed completed", counts);
};

run()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error(error);
    await sql.end({ timeout: 0 });
    process.exit(1);
  });
