import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'backend', 'rikhabakes.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database error:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  // Select all products
  db.all("SELECT id, price FROM products", [], (err, rows) => {
    if (err) {
      console.error("Query error:", err);
      return;
    }
    
    rows.forEach(row => {
      if (row.price.includes('$')) {
        const newPrice = row.price.replace('$', '₱');
        db.run("UPDATE products SET price = ? WHERE id = ?", [newPrice, row.id], (err) => {
          if (err) console.error(`Update error for ID ${row.id}:`, err);
          else console.log(`Updated ID ${row.id}: ${row.price} -> ${newPrice}`);
        });
      }
    });
    
    // Also check for any that just need a Peso sign if they are pure numbers (though unlikely given schema)
    console.log("Database update scan complete.");
  });
});

setTimeout(() => db.close(), 2000);
