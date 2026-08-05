const fs = require("fs");
const path = require("path");
const postgresModule = require("postgres");
const postgres = postgresModule.default || postgresModule;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const sql = postgres(databaseUrl, { max: 1 });
const migrationsDir = path.resolve(__dirname, "..", "migrations");

const run = async () => {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await sql`
    create table if not exists backend_schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `;

  for (const filename of files) {
    const [applied] = await sql`
      select filename from backend_schema_migrations where filename = ${filename}
    `;
    if (applied) continue;

    const source = fs.readFileSync(path.join(migrationsDir, filename), "utf8");
    await sql.begin(async (tx) => {
      await tx.unsafe(source);
      await tx`
        insert into backend_schema_migrations (filename) values (${filename})
      `;
    });
    console.log(`Applied migration ${filename}`);
  }
};

run()
  .then(() => sql.end())
  .catch(async (error) => {
    console.error(error);
    await sql.end({ timeout: 0 });
    process.exit(1);
  });
