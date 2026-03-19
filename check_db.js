import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'backend', 'rikhabakes.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) { console.error(err); process.exit(1); }
});

db.serialize(() => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) { console.error(err); return; }
    console.log("Current Products in DB:");
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
      console.log("Database has data. Checking for $...");
      rows.forEach(row => {
        if (row.price.includes('$')) {
           console.log(`FOUND DOLLAR in ID ${row.id}: ${row.price}`);
        }
      });
    } else {
      console.log("Database products table is EMPTY. Falling back to server.js values.");
    }
  });
});

setTimeout(() => db.close(), 1000);
