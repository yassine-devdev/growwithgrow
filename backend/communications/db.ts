import { SQLDatabase } from "encore.dev/storage/sqldb";

export const communicationsDB = new SQLDatabase("communications", {
  migrations: "./migrations",
});
