const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");

const databaseUrl = "postgresql://qtitpc:21107@localhost:5433/duolingo";
const client = postgres(databaseUrl);
const db = drizzle(client);

async function test() {
  try {
    const res = await db.execute('SELECT * FROM user_xp_summary LIMIT 1');
    console.log("user_xp_summary works! Rows:", res.length);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    process.exit(0);
  }
}
test();
