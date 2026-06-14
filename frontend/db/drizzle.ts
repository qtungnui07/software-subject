import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost/dummy";
const sql = neon(databaseUrl);
const db = drizzle(sql, {schema});
 
export default db;
