import { SQLDatabase } from "encore.dev/storage/sqldb";

export const academicsDB = new SQLDatabase("academics", {
  migrations: "./migrations",
});
