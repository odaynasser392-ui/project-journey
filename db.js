const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'database', 'project_journey.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const db = new sqlite3.Database(dbPath);

db.exec(fs.readFileSync(schemaPath, 'utf8'), (error) => {
  if (error) console.error('Database initialization failed:', error.message);
});

function all(sql, params = []) {
  return new Promise((resolve, reject) => db.all(sql, params, (e, rows) => e ? reject(e) : resolve(rows)));
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => db.get(sql, params, (e, row) => e ? reject(e) : resolve(row)));
}
function run(sql, params = []) {
  return new Promise((resolve, reject) => db.run(sql, params, function (e) {
    if (e) reject(e); else resolve({ id: this.lastID, changes: this.changes });
  }));
}
module.exports = { db, all, get, run };
