import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const databaseUrl = process.env.DATABASE_URL;

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
};

export const sql = databaseUrl
  ? neon(databaseUrl)
  : (() => {
      console.warn("DATABASE_URL is not set. Using users_mock.json offline database mock.");
      const filePath = path.join(process.cwd(), "users_mock.json");
      
      const readUsers = (): any[] => {
        try {
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([], null, 2));
            return [];
          }
          return JSON.parse(fs.readFileSync(filePath, "utf-8"));
        } catch {
          return [];
        }
      };

      const writeUsers = (users: any[]) => {
        try {
          fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
        } catch (err) {
          console.error("Failed to write to mock database file:", err);
        }
      };

      const mockSql = async (strings: TemplateStringsArray, ...values: any[]) => {
        const queryText = strings.join("").trim().replace(/\s+/g, " ");

        // 1. SELECT query
        if (queryText.includes("SELECT") && queryText.includes("FROM users")) {
          const email = values[0];
          const users = readUsers();
          const user = users.find((u: any) => u.email === email);
          if (user) {
            return [{
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password,
              created_at: new Date(user.created_at)
            }];
          }
          return [];
        }

        // 2. INSERT query
        if (queryText.includes("INSERT INTO users")) {
          const name = values[0];
          const email = values[1];
          const password = values[2];

          const users = readUsers();
          const newUser = {
            id: Math.random().toString(36).substring(2, 11),
            name,
            email,
            password,
            created_at: new Date().toISOString()
          };
          users.push(newUser);
          writeUsers(users);
          return [newUser];
        }

        return [];
      };

      return mockSql as any;
    })();
