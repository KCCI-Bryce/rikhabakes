import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(process.cwd(), 'backend', 'rikhabakes.db'), (err) => {
  if (err) console.error("Could not connect to database", err);
  else console.log("Connected to SQLite database");
});

// Create tables if they don't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE)");
  db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price TEXT, image_url TEXT)");
});

// Newsletter Subscription Endpoint
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ detail: "Email required" });
  
  db.run("INSERT INTO subscribers (email) VALUES (?)", [email], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(400).json({ detail: "Email already registered" });
      }
      return res.status(500).json({ detail: "Database error" });
    }
    console.log(`New subscriber added: ${email}`);
    res.json({ id: this.lastID, email });
  });
});

// Products Endpoint
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ detail: "Database error" });
    if (rows.length === 0) {
      // Fallback data if table is empty
      return res.json([
        {"id": 1, "name": "Classic Croissant", "price": "$4.50", "image_url": "https://images.unsplash.com/photo-1555507036-ab1f40ce88f4?auto=format&fit=crop&w=400&q=80"},
        {"id": 2, "name": "Sourdough Loaf", "price": "$8.00", "image_url": "https://images.unsplash.com/photo-1585478259715-876a6a81fa08?auto=format&fit=crop&w=400&q=80"},
        {"id": 3, "name": "Almond Tart", "price": "$6.25", "image_url": "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=400&q=80"}
      ]);
    }
    res.json(rows);
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Node backend running on http://127.0.0.1:${PORT}`);
});
