import { SQLDatabase } from "encore.dev/storage/sqldb";

export const gamificationDB = new SQLDatabase("gamification", {
  migrations: "./migrations",
});
