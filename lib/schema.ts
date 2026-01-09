// lib/schema.ts
import { mysqlTable, varchar, int, datetime, time } from 'drizzle-orm/mysql-core';

export const productionProgress = mysqlTable('production_progress', {
  id_process: int('id_process').autoincrement().primaryKey(),
  id_product: varchar('id_product', { length: 50 }),
  id_perproduct: varchar('id_perproduct', { length: 50 }),
  project_name: varchar('project_name', { length: 50 }),
  product_name: varchar('product_name', { length: 50 }),
  line: varchar('line', { length: 50 }),
  workshop: varchar('workshop', { length: 50 }),
  process_name: varchar('process_name', { length: 50 }),
  workstation: int('workstation'),
  operator_actual_rfid: int('operator_actual_rfid'),
  operator_actual_name: varchar('operator_actual_name', { length: 50 }),
  start_actual: datetime('start_actual'),
  duration_sec_actual: int('duration_sec_actual'),
  duration_time_actual: time('duration_time_actual'),
  status: varchar('status', { length: 50 }),
  finish_actual: datetime('finish_actual'),
});