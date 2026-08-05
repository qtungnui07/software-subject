const normalizeText = (value, caseSensitive = false) => {
  const normalized = String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/g, "");
  return caseSensitive ? normalized : normalized.toLocaleLowerCase("en-US");
};

const mapNode = (row) => ({
  id: row.id,
  legacyId: row.legacy_id ?? undefined,
  type: row.node_type,
  title: row.title,
  shortTitle: row.short_title,
  description: row.description,
  order: row.sort_order,
  unlockAfterId: row.unlock_after_id,
  href: row.href,
  xp: row.xp,
  countsTowardProgress: row.counts_toward_progress,
  contentStatus: row.content_status,
  rewards: row.rewards || [],
  roadmapPosition: row.roadmap_position || undefined,
});

const mapExercise = (row, includeAnswers = false) => ({
  id: row.id,
  lessonId: row.node_id,
  type: row.exercise_type,
  instruction: row.instruction,
  prompt: row.prompt,
  skill: row.skill,
  difficulty: row.difficulty,
  explanation: includeAnswers ? row.explanation ?? undefined : undefined,
  hint: row.hint ?? undefined,
  context: row.context_payload ?? undefined,
  contentVersion: row.content_version,
  ...(row.public_payload || {}),
  ...(includeAnswers ? row.answer_payload || {} : {}),
});

const createContentStore = (sql) => {
  const getCourses = async () => {
    const rows = await sql`
      select id, content_id, legacy_ids, language_code, title, "imageSrc",
             content_status, content_release_id
      from courses
      where content_id is not null
      order by id
    `;
    return rows.map((row) => ({
      databaseId: row.id,
      id: row.content_id,
      legacyIds: row.legacy_ids || [],
      languageCode: row.language_code,
      title: row.title,
      imageSrc: row.imageSrc,
      contentStatus: row.content_status,
      contentReleaseId: row.content_release_id,
    }));
  };

  const getCourse = async (courseId) => {
    const [course] = await sql`
      select id, content_id, legacy_ids, language_code, title, "imageSrc",
             content_release_id
      from courses
      where content_id = ${courseId} or legacy_ids ? ${courseId}
      limit 1
    `;
    if (!course) return null;

    const sections = await sql`
      select * from course_sections
      where course_content_id = ${course.content_id}
      order by sort_order
    `;
    const chapters = await sql`
      select ch.*
      from course_chapters ch
      join course_sections s on s.id = ch.section_id
      where s.course_content_id = ${course.content_id}
      order by s.sort_order, ch.sort_order
    `;
    const nodes = await sql`
      select n.*
      from learning_nodes n
      join course_chapters ch on ch.id = n.chapter_id
      join course_sections s on s.id = ch.section_id
      where s.course_content_id = ${course.content_id}
      order by s.sort_order, ch.sort_order, n.sort_order
    `;

    return {
      id: course.content_id,
      legacyIds: course.legacy_ids || [],
      languageCode: course.language_code,
      title: course.title,
      imageSrc: course.imageSrc,
      contentReleaseId: course.content_release_id,
      sections: sections.map((section) => {
        const chapter = chapters.find((item) => item.section_id === section.id);
        return {
          id: section.id,
          courseId: course.content_id,
          order: section.sort_order,
          level: section.level,
          title: section.title,
          description: section.description,
          contentStatus: section.content_status,
          chapter: {
            id: chapter.id,
            sectionId: section.id,
            order: chapter.sort_order,
            title: chapter.title,
            description: chapter.description,
            nodes: nodes
              .filter((node) => node.chapter_id === chapter.id)
              .map(mapNode),
          },
        };
      }),
    };
  };

  const getNode = async (nodeId) => {
    const [row] = await sql`
      select n.*, ch.section_id, ch.title as chapter_title,
             ch.sort_order as chapter_order, s.course_content_id,
             s.title as section_title, s.sort_order as section_order
      from learning_nodes n
      join course_chapters ch on ch.id = n.chapter_id
      join course_sections s on s.id = ch.section_id
      where n.id = ${nodeId}
      limit 1
    `;
    if (!row) return null;
    const [detail] = await sql`
      select * from lesson_details where node_id = ${nodeId}
    `;
    const [summary] = await sql`
      select count(*)::int as exercise_count,
             coalesce(array_agg(distinct exercise_type)
               filter (where exercise_type is not null), '{}') as exercise_types,
             coalesce(array_agg(distinct skill)
               filter (where skill is not null), '{}') as skills
      from exercises where node_id = ${nodeId}
    `;
    return {
      ...mapNode(row),
      courseId: row.course_content_id,
      section: {
        id: row.section_id,
        title: row.section_title,
        order: row.section_order,
      },
      chapter: {
        id: row.chapter_id,
        title: row.chapter_title,
        order: row.chapter_order,
      },
      detail: detail
        ? {
            nodeId,
            overview: detail.overview,
            objectives: detail.objectives || [],
            focusSkills: detail.focus_skills || [],
            estimatedMinutes: detail.estimated_minutes,
            checkpointUnlocks: detail.checkpoint_unlocks ?? undefined,
          }
        : null,
      exerciseSummary: {
        count: summary.exercise_count,
        types: summary.exercise_types,
        skills: summary.skills,
      },
    };
  };

  const getExercises = async (nodeId, includeAnswers = false) => {
    const rows = await sql`
      select * from exercises where node_id = ${nodeId} order by sort_order
    `;
    return rows.map((row) => mapExercise(row, includeAnswers));
  };

  const checkExercise = async (exerciseId, answer) => {
    const [row] = await sql`select * from exercises where id = ${exerciseId}`;
    if (!row) return null;
    const exercise = mapExercise(row, true);
    let scoreRatio = 0;
    let correctAnswerText = "";
    let normalizedUserAnswer = "";

    if (
      ["multiple_choice", "dialogue_choice", "listening_choice"].includes(
        exercise.type,
      )
    ) {
      const optionId = answer?.type === "choice" ? answer.optionId : "";
      scoreRatio = optionId === exercise.correctOptionId ? 1 : 0;
      correctAnswerText =
        exercise.options?.find((option) => option.id === exercise.correctOptionId)
          ?.text || "";
      normalizedUserAnswer =
        exercise.options?.find((option) => option.id === optionId)?.text || "";
    } else if (exercise.type === "arrange_words") {
      const ids = answer?.type === "arrange_words" ? answer.tokenIds : [];
      scoreRatio =
        ids.length === exercise.correctOrder.length &&
        ids.every((id, index) => id === exercise.correctOrder[index])
          ? 1
          : 0;
      const text = new Map(exercise.tokens.map((token) => [token.id, token.text]));
      correctAnswerText = exercise.correctOrder.map((id) => text.get(id) || "").join(" ");
      normalizedUserAnswer = ids.map((id) => text.get(id) || "").join(" ");
    } else if (exercise.type === "fill_blank") {
      const value = answer?.type === "fill_blank" ? answer.value : "";
      normalizedUserAnswer = normalizeText(value, exercise.caseSensitive);
      const accepted = exercise.acceptedAnswers.map((item) =>
        normalizeText(item, exercise.caseSensitive),
      );
      scoreRatio = accepted.includes(normalizedUserAnswer) ? 1 : 0;
      correctAnswerText = exercise.acceptedAnswers[0] || "";
    } else if (exercise.type === "match_pairs") {
      const pairs = answer?.type === "match_pairs" ? answer.pairs : [];
      const submitted = new Map(pairs.map((pair) => [pair.leftId, pair.rightId]));
      const correct = exercise.correctPairs.filter(
        (pair) => submitted.get(pair.leftId) === pair.rightId,
      ).length;
      scoreRatio =
        exercise.correctPairs.length === 0
          ? 0
          : correct / exercise.correctPairs.length;
      correctAnswerText = JSON.stringify(exercise.correctPairs);
      normalizedUserAnswer = JSON.stringify(pairs);
    } else if (exercise.type === "arrange_dialogue") {
      const ids = answer?.type === "arrange_dialogue" ? answer.lineIds : [];
      const correct = exercise.correctOrder.filter(
        (id, index) => ids[index] === id,
      ).length;
      scoreRatio =
        ids.length === exercise.correctOrder.length
          ? correct / exercise.correctOrder.length
          : 0;
      correctAnswerText = exercise.correctOrder.join(",");
      normalizedUserAnswer = ids.join(",");
    } else if (exercise.type === "sentence_rewrite") {
      const value = answer?.type === "sentence_rewrite" ? answer.value : "";
      normalizedUserAnswer = normalizeText(value, exercise.caseSensitive);
      const accepted = exercise.acceptedAnswers.map((item) =>
        normalizeText(item, exercise.caseSensitive),
      );
      scoreRatio = accepted.includes(normalizedUserAnswer) ? 1 : 0;
      correctAnswerText = exercise.acceptedAnswers[0] || "";
    } else if (exercise.type === "short_writing") {
      const value = answer?.type === "short_writing" ? String(answer.value || "") : "";
      const words = value.trim().split(/\s+/).filter(Boolean);
      const comparable = normalizeText(value);
      const matches = exercise.suggestedWords.filter((word) =>
        comparable.includes(normalizeText(word)),
      ).length;
      const lengthPassed =
        words.length >= exercise.minWords &&
        words.length <= exercise.maxWords + Math.max(1, Math.floor(exercise.maxWords * 0.2));
      const keywordRatio =
        exercise.minimumSuggestedWordMatches === 0
          ? 1
          : Math.min(1, matches / exercise.minimumSuggestedWordMatches);
      scoreRatio = Number(
        ((lengthPassed ? 0.4 : 0) + keywordRatio * 0.5 + (value.trim() ? 0.1 : 0)).toFixed(4),
      );
      correctAnswerText = exercise.sampleAnswer || "";
      normalizedUserAnswer = value.trim().replace(/\s+/g, " ");
    }

    return {
      isCorrect: scoreRatio === 1,
      scoreRatio,
      correctAnswerText,
      normalizedUserAnswer,
      explanation: exercise.explanation,
      reveal: row.answer_payload || {},
    };
  };

  const getCheckpoint = async (nodeId) => {
    const [node] = await sql`
      select n.*, d.estimated_minutes
      from learning_nodes n
      join lesson_details d on d.node_id = n.id
      where n.id = ${nodeId} and n.node_type = 'checkpoint'
      limit 1
    `;
    if (!node) return null;

    const exercises = await getExercises(nodeId, false);
    const assessmentRows = await sql`
      select id, assessment_payload
      from exercises
      where node_id = ${nodeId}
      order by sort_order
    `;

    return {
      checkpointId: node.id,
      title: node.title,
      description: node.description,
      passThreshold: node.pass_threshold ?? 70,
      estimatedMinutes: node.estimated_minutes,
      exercises,
      assessments: assessmentRows.map((row) => row.assessment_payload),
    };
  };

  const gradeCheckpoint = async (submission) => {
    const checkpointId = String(submission?.checkpointId || "");
    const checkpoint = await getCheckpoint(checkpointId);
    if (!checkpoint) {
      const error = new Error("Checkpoint does not exist");
      error.status = 404;
      throw error;
    }

    const submittedAnswers = Array.isArray(submission?.answers)
      ? submission.answers
      : [];
    const answerIds = submittedAnswers.map((entry) => entry.exerciseId);
    if (new Set(answerIds).size !== answerIds.length) {
      const error = new Error("Duplicate checkpoint answers");
      error.status = 400;
      throw error;
    }

    const knownIds = new Set(
      checkpoint.exercises.map((exercise) => exercise.id),
    );
    if (answerIds.some((id) => !knownIds.has(id))) {
      const error = new Error("Unknown checkpoint exercise");
      error.status = 400;
      throw error;
    }

    const answers = new Map(
      submittedAnswers.map((entry) => [entry.exerciseId, entry.answer]),
    );
    const categories = new Map();
    const lessonLoss = new Map();
    let earnedWeight = 0;
    let totalWeight = 0;

    const reviews = [];
    for (const [index, exercise] of checkpoint.exercises.entries()) {
      const assessment = checkpoint.assessments[index];
      if (!assessment) {
        const error = new Error(
          `Checkpoint assessment is missing for ${exercise.id}`,
        );
        error.status = 500;
        throw error;
      }
      const answer = answers.get(exercise.id);
      const result =
        answer === undefined
          ? null
          : await checkExercise(exercise.id, answer);
      const scoreRatio = result?.scoreRatio ?? 0;
      const weight = Number(assessment.weight) || 1;
      const weightedScore = scoreRatio * weight;
      earnedWeight += weightedScore;
      totalWeight += weight;

      const currentCategory = categories.get(assessment.category) || {
        earnedWeight: 0,
        totalWeight: 0,
      };
      currentCategory.earnedWeight += weightedScore;
      currentCategory.totalWeight += weight;
      categories.set(assessment.category, currentCategory);

      const loss = (1 - scoreRatio) * weight;
      if (loss > 0) {
        for (const lessonId of assessment.recommendedLessonIds || []) {
          lessonLoss.set(lessonId, (lessonLoss.get(lessonId) || 0) + loss);
        }
      }

      reviews.push({
        exerciseId: exercise.id,
        order: index + 1,
        scoreRatio,
        status:
          answer === undefined
            ? "unanswered"
            : scoreRatio === 1
              ? "correct"
              : scoreRatio > 0
                ? "partial"
                : "incorrect",
        result,
        transcript:
          exercise.context?.kind === "listening"
            ? exercise.context.transcriptAfterSubmit ??
              exercise.context.spokenText ??
              null
            : null,
      });
    }

    const round = (value) => Math.round(value * 100) / 100;
    const score =
      totalWeight === 0 ? 0 : round((earnedWeight / totalWeight) * 100);
    const skillScores = Array.from(categories.entries())
      .map(([category, value]) => ({
        category,
        earnedWeight: round(value.earnedWeight),
        totalWeight: round(value.totalWeight),
        score:
          value.totalWeight === 0
            ? 0
            : round((value.earnedWeight / value.totalWeight) * 100),
      }))
      .sort((left, right) => left.category.localeCompare(right.category));

    return {
      checkpointId,
      totalQuestions: checkpoint.exercises.length,
      answeredQuestions: reviews.filter(
        (review) => review.status !== "unanswered",
      ).length,
      earnedWeight: round(earnedWeight),
      totalWeight: round(totalWeight),
      score,
      passed: score >= checkpoint.passThreshold,
      skillScores,
      recommendedLessonIds: Array.from(lessonLoss.entries())
        .sort((left, right) => right[1] - left[1])
        .slice(0, 3)
        .map(([lessonId]) => lessonId),
      reviews,
      passThreshold: checkpoint.passThreshold,
    };
  };

  const getPlacementTest = async (courseId = "english") => {
    const [test] = await sql`
      select * from placement_tests
      where course_content_id = ${courseId} and status = 'published'
      order by updated_at desc
      limit 1
    `;
    if (!test) return null;
    const rows = await sql`
      select * from placement_questions
      where test_id = ${test.id}
      order by sort_order
    `;
    return {
      id: test.id,
      courseId,
      testVersion: test.test_version,
      totalQuestions: rows.length,
      questions: rows.map((row) => ({
        id: row.id,
        type: row.exercise_type,
        instruction: row.instruction,
        prompt: row.prompt,
        skill: row.skill,
        difficulty: row.difficulty,
        order: row.sort_order,
        ...(row.public_payload || {}),
      })),
    };
  };

  const gradePlacementTest = async (submission) => {
    const [test] = await sql`
      select * from placement_tests
      where test_version = ${submission?.testVersion || ""}
        and status = 'published'
      limit 1
    `;
    if (!test) {
      const error = new Error("Placement test version is no longer active");
      error.status = 409;
      throw error;
    }
    const rows = await sql`
      select * from placement_questions
      where test_id = ${test.id}
      order by sort_order
    `;
    const submittedAnswers = Array.isArray(submission?.answers)
      ? submission.answers
      : [];
    const answerIds = submittedAnswers.map((entry) => entry.questionId);
    if (new Set(answerIds).size !== answerIds.length) {
      const error = new Error("Duplicate placement question answers");
      error.status = 400;
      throw error;
    }
    const knownIds = new Set(rows.map((row) => row.id));
    if (answerIds.some((id) => !knownIds.has(id))) {
      const error = new Error("Unknown placement question");
      error.status = 400;
      throw error;
    }
    const answers = new Map(
      submittedAnswers.map((entry) => [entry.questionId, entry.answer]),
    );
    const scoredAnswers = rows.map((row) => {
      const answer = answers.get(row.id) || null;
      const rules = row.answer_payload || {};
      const publicPayload = row.public_payload || {};
      let isCorrect = false;
      if (
        ["multiple_choice", "dialogue_choice", "listening_choice"].includes(
          row.exercise_type,
        )
      ) {
        isCorrect =
          answer?.type === "choice" &&
          answer.optionId === rules.correctOptionId &&
          publicPayload.options?.some((option) => option.id === answer.optionId);
      } else if (row.exercise_type === "arrange_words") {
        const ids = answer?.type === "arrange_words" ? answer.tokenIds : [];
        isCorrect =
          Array.isArray(ids) &&
          ids.length === rules.correctOrder.length &&
          ids.every((id, index) => id === rules.correctOrder[index]);
      } else if (row.exercise_type === "fill_blank") {
        const value = answer?.type === "fill_blank" ? answer.value : "";
        isCorrect = (rules.acceptedAnswers || [])
          .map((item) => normalizeText(item, rules.caseSensitive))
          .includes(normalizeText(value, rules.caseSensitive));
      }
      return {
        questionId: row.id,
        answer,
        band: row.band,
        skill: row.skill,
        isCorrect,
      };
    });
    const bandScores = { basic: 0, intermediate: 0, advanced: 0 };
    for (const item of scoredAnswers) {
      if (!item.isCorrect) continue;
      bandScores[item.band === 1 ? "basic" : item.band === 2 ? "intermediate" : "advanced"] += 1;
    }
    const totalCorrect = scoredAnswers.filter((item) => item.isCorrect).length;
    const assignedSectionId =
      totalCorrect >= 9 &&
      bandScores.basic >= 2 &&
      bandScores.intermediate >= 3 &&
      bandScores.advanced >= 3
        ? "english-section-3"
        : totalCorrect >= 5 &&
            bandScores.basic >= 2 &&
            bandScores.intermediate >= 2
          ? "english-section-2"
          : "english-section-1";
    return {
      testVersion: test.test_version,
      totalQuestions: rows.length,
      totalCorrect,
      bandScores,
      assignedSectionId,
      scoredAnswers,
    };
  };

  const getQuestDefinitions = async () => {
    const rows = await sql`
      select * from quest_definitions order by quest_type, sort_order
    `;
    return rows.map((row) => ({
      id: row.id,
      type: row.quest_type,
      title: row.title,
      description: row.description,
      metric: row.metric,
      target: row.target_value,
      reward: row.reward_payload,
      icon: row.icon,
      order: row.sort_order,
      isPreview: row.is_preview,
    }));
  };

  const getContentSummary = async () => {
    const [row] = await sql`
      select
        (select count(*)::int from courses where content_id is not null) as courses,
        (select count(*)::int from course_sections) as sections,
        (select count(*)::int from learning_nodes) as nodes,
        (select count(*)::int from exercises) as exercises,
        (select count(*)::int from placement_questions) as placement_questions,
        (select count(*)::int from quest_definitions) as quests
    `;
    return row;
  };

  const updateNode = async (nodeId, payload) => {
    const { description, xp, estimatedMinutes, objectives, title } = payload;

    await sql.begin(async (tx) => {
      if (title !== undefined || description !== undefined || xp !== undefined) {
        await tx`
          update learning_nodes
          set
            title = coalesce(${title ?? null}, title),
            description = coalesce(${description ?? null}, description),
            xp = coalesce(${xp !== undefined ? Number(xp) : null}, xp),
            updated_at = now()
          where id = ${nodeId}
        `;
      }

      if (estimatedMinutes !== undefined || objectives !== undefined || description !== undefined) {
        await tx`
          update lesson_details
          set
            overview = coalesce(${description ?? null}, overview),
            estimated_minutes = coalesce(${estimatedMinutes !== undefined ? Number(estimatedMinutes) : null}, estimated_minutes),
            objectives = coalesce(${objectives ? tx.json(objectives) : null}, objectives),
            updated_at = now()
          where node_id = ${nodeId}
        `;
      }
    });

    return getNode(nodeId);
  };

  const updateExercise = async (exerciseId, payload) => {
    const {
      instruction,
      prompt,
      explanation,
      options,
      correctOptionId,
      tokens,
      correctOrder,
      acceptedAnswers,
      sentenceBefore,
      sentenceAfter,
    } = payload;

    const [current] = await sql`select * from exercises where id = ${exerciseId}`;
    if (!current) return null;

    let publicPayload = current.public_payload || {};
    if (Array.isArray(options)) publicPayload = { ...publicPayload, options };
    if (Array.isArray(tokens)) publicPayload = { ...publicPayload, tokens };
    if (sentenceBefore !== undefined) publicPayload = { ...publicPayload, sentenceBefore };
    if (sentenceAfter !== undefined) publicPayload = { ...publicPayload, sentenceAfter };

    let answerPayload = current.answer_payload || {};
    if (correctOptionId !== undefined) answerPayload = { ...answerPayload, correctOptionId };
    if (Array.isArray(correctOrder)) answerPayload = { ...answerPayload, correctOrder };
    if (Array.isArray(acceptedAnswers)) answerPayload = { ...answerPayload, acceptedAnswers };

    await sql`
      update exercises
      set
        instruction = coalesce(${instruction ?? null}, instruction),
        prompt = coalesce(${prompt ?? null}, prompt),
        explanation = coalesce(${explanation ?? null}, explanation),
        public_payload = ${sql.json(publicPayload)},
        answer_payload = ${sql.json(answerPayload)},
        updated_at = now()
      where id = ${exerciseId}
    `;

    const [row] = await sql`select * from exercises where id = ${exerciseId}`;
    return row ? mapExercise(row, true) : null;
  };

  return {
    getCourses,
    getCourse,
    getNode,
    getExercises,
    checkExercise,
    getCheckpoint,
    gradeCheckpoint,
    getPlacementTest,
    gradePlacementTest,
    getQuestDefinitions,
    getContentSummary,
    updateNode,
    updateExercise,
  };
};

module.exports = { createContentStore };
