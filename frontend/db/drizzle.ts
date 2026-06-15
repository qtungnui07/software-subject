import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "postgresql://qtitpc:21107qt@localhost:5432/duolingo";
const client = postgres(databaseUrl);
const db = drizzle(client, { schema });
 
export default db;
