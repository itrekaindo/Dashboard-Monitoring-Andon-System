import { mysqlTable, int, varchar, datetime, mysqlEnum, tinyint } from "drizzle-orm/mysql-core";

export const authUsers = mysqlTable("auth_users", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["ADMIN", "PENGENDALIAN", "PERENCANAAN", "GUEST"]).notNull(),
  isActive: tinyint("isActive").notNull(), // 0/1
  createdAt: datetime("createdAt", { mode: "string" }).notNull(),
  updatedAt: datetime("updatedAt", { mode: "string" }).notNull(),
});