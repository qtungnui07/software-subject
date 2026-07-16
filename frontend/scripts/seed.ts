import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { courses } from "../db/schema";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
}

const client = postgres(databaseUrl);
const db = drizzle(client);

async function main() {
    console.log("Seeding database...");
    
    // Clear existing data (optional, but good for clean start)
    await db.delete(courses);
    
    const initialCourses = [
        { id: 1, title: "Tiếng Anh", imageSrc: "/gb.svg" },
        { id: 2, title: "Tiếng Nhật", imageSrc: "/jp.svg" },
        { id: 3, title: "Tiếng Pháp", imageSrc: "/fr.svg" },
        { id: 4, title: "Tiếng Tây Ban Nha", imageSrc: "/es.svg" },
        { id: 5, title: "Tiếng Ý", imageSrc: "/it.svg" },
    ];
    
    await db.insert(courses).values(initialCourses);
    
    console.log("Seeding completed successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:");
    console.error(err);
    process.exit(1);
});
