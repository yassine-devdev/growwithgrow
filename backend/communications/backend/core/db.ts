import { SQLDatabase } from "encore.dev/storage/sqldb";

export const coreDB = new SQLDatabase("core", {
  migrations: "./migrations",
});
