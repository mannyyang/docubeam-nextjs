import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export let db: NeonHttpDatabase<typeof schema> | null = null;

export const getDB = () => {
  if (db) {
    return db;
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable not found");
  }

  const sql = neon(databaseUrl);
  db = drizzle(sql, { schema, logger: true });

  return db;
};
