// db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

sqlite3.verbose();

export async function initDb() {
  const db = await open({
    filename: 'students.sqlite',
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT NOT NULL,
      lastname  TEXT NOT NULL,
      gender    TEXT NOT NULL,
      age       INTEGER
    );
  `);

  return db;
}
