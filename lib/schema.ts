// lib/schema.ts
import { mysqlTable, varchar, int, timestamp } from 'drizzle-orm/mysql-core';

export const productionProgress = mysqlTable('production_progress', {
  id_process: int('id_process').autoincrement().primaryKey(),
  id_project: varchar('id_project', { length: 50 }),
  id_product: varchar('id_product', { length: 50 }),
  id_perproduct: varchar('id_perproduct', { length: 50 }),
  project_name: varchar('project_name', { length: 50 }),
  product_name: varchar('product_name', { length: 50 }),
  line: varchar('line', { length: 50 }).notNull(),
  workshop: varchar('workshop', { length: 50 }),
  product_status: varchar('product_status', { length: 50 }),
  drawing_link: varchar('drawing_link', { length: 50 }),
  operator_assigned: varchar('operator_assigned', { length: 50 }),
  operator_nip: int('operator_nip'),
  process_name: varchar('process_name', { length: 50 }),
  workstation: int('workstation'),
  operator_actual_nip: int('operator_actual_nip'),
  operator_actual_name: varchar('operator_actual_name', { length: 50 }),
  timestamps: timestamp('timestamps'),
  finish_schedule: timestamp('finish_schedule'),
});