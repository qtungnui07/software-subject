import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
};

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Refusing to use users_mock.json.");
}

export const sql = neon(databaseUrl);
