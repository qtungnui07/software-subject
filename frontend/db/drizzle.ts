import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL || "postgresql://mock_user:mock_password@mock_host.neon.tech/mock_db?sslmode=require";
const sql = neon(databaseUrl);
const db = drizzle(sql, {schema});
 
export default db;
