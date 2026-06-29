import type { Config } from "drizzle-kit";

try {
    const { config } = require("dotenv");
    config({ path: ".env.local" });
} catch (e) {
    // dotenv might not be found by drizzle-kit loader, fallback to process.env
}

export default {
    schema: "./db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgresql://qtitpc:21107@127.0.0.1:5432/duolingo",
    },
} satisfies Config;