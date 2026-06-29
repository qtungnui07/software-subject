const postgres = require('postgres');
async function test() {
  try {
    const sql = postgres('postgresql://qtitpc:21107@127.0.0.1:5432/duolingo');
    await sql`SELECT 1`;
    console.log("Success with 21107");
    process.exit(0);
  } catch (e) {
    console.error("Failed with 21107:", e.message);
    try {
      const sql2 = postgres('postgresql://qtitpc:21107qt@127.0.0.1:5432/duolingo');
      await sql2`SELECT 1`;
      console.log("Success with 21107qt");
      process.exit(0);
    } catch (e2) {
      console.error("Failed with 21107qt:", e2.message);
      process.exit(1);
    }
  }
}
test();
