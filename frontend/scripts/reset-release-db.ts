import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(databaseUrl, { max: 1 });

const courses = [
  { title: "Tiếng Anh", imageSrc: "/gb.svg" },
  { title: "Tiếng Nhật", imageSrc: "/jp.svg" },
  { title: "Tiếng Pháp", imageSrc: "/fr.svg" },
  { title: "Tiếng Tây Ban Nha", imageSrc: "/es.svg" },
  { title: "Tiếng Ý", imageSrc: "/it.svg" },
];

const tablesToCount = [
  "users",
  "local_sessions",
  "user_progress",
  "user_xp_summary",
  "study_time_summary",
  "chapter_one_progress",
  "xp_events",
  "lesson_xp_claims",
  "quest_daily_stats",
  "quest_reward_claims",
  "user_streaks",
  "daily_streak_logs",
  "courses",
];

const main = async () => {
  await sql.begin(async (tx) => {
    await tx.unsafe(`
      truncate table
        quest_reward_claims,
        quest_daily_stats,
        lesson_xp_claims,
        xp_events,
        study_time_summary,
        chapter_one_progress,
        user_xp_summary,
        daily_streak_logs,
        user_streaks,
        user_progress,
        local_sessions,
        users
      restart identity cascade
    `);

    await tx.unsafe("truncate table courses restart identity cascade");

    for (const course of courses) {
      await tx`
        insert into courses (title, "imageSrc")
        values (${course.title}, ${course.imageSrc})
      `;
    }
  });

  for (const table of tablesToCount) {
    const [row] = await sql.unsafe(
      `select count(*)::int as count from ${table}`
    );
    console.log(`${table}: ${row.count}`);
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
