import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'codeleap.db');

// Initialize the database connection
export async function getDbConnection() {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
}

// Initialize the database schema
export async function initDb() {
  const db = await getDbConnection();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      step_id INTEGER,
      rating TEXT NOT NULL,
      comment TEXT,
      user_id TEXT
    )
  `);
  
  return db;
}

// Store feedback for a learning plan
export async function storeFeedback({ 
  planId, 
  stepId = null, 
  rating, 
  comment = "", 
  userId = "anonymous" 
}: {
  planId: string;
  stepId?: number | null;
  rating: 'thumbs_up' | 'thumbs_down';
  comment?: string;
  userId?: string;
}) {
  const db = await getDbConnection();
  const timestamp = new Date().toISOString();
  
  await db.run(
    `INSERT INTO feedback (timestamp, plan_id, step_id, rating, comment, user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [timestamp, planId, stepId, rating, comment, userId]
  );
  
  return true;
}

// Get feedback for a learning plan
export async function getFeedback(planId: string) {
  const db = await getDbConnection();
  
  return db.all(
    `SELECT * FROM feedback WHERE plan_id = ? ORDER BY timestamp DESC`,
    [planId]
  );
} 