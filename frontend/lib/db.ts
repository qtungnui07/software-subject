import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

export const sql = databaseUrl
  ? neon(databaseUrl)
  : ((async () => {
      throw new Error(
        "DATABASE_URL environment variable is not set. Add it before using database features."
      );
    }) as unknown as ReturnType<typeof neon>);

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
};
