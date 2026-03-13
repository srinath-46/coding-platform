/**
 * Migration runner – executes initDatabase.sql against MySQL
 * Usage: npm run migrate
 */
const fs   = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runMigrations() {
  const sqlFile = path.join(__dirname, 'initDatabase.sql');
  const sql     = fs.readFileSync(sqlFile, 'utf8');

  // Split on semicolons, ignore empty lines
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const conn = await mysql.createConnection({
    host    : process.env.DB_HOST,
    port    : parseInt(process.env.DB_PORT) || 3306,
    user    : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: false,
  });

  // Create database first
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${process.env.DB_NAME}\``);

  console.log('🚀  Running migrations…');
  for (const stmt of statements) {
    if (stmt.startsWith('--') || stmt.startsWith('CREATE DATABASE') || stmt.startsWith('USE')) continue;
    try {
      await conn.query(stmt);
    } catch (err) {
      console.error('❌  Migration error on:', stmt.substring(0, 80));
      console.error(err.message);
    }
  }

  await conn.end();
  console.log('✅  All migrations complete!');
}

runMigrations().catch(err => { console.error(err); process.exit(1); });
