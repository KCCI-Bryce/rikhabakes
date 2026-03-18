import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'rikhabakes-premium-secret-5012';

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
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)");
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

// Authentication Endpoints
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ detail: "Email and password required" });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE")) return res.status(400).json({ detail: "Email already exists" });
      return res.status(500).json({ detail: "Database error" });
    }
    const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, email });
  });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ detail: "Email and password required" });
  
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ detail: "Database error" });
    if (!user) return res.status(400).json({ detail: "Invalid email or password" });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ detail: "Invalid email or password" });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, email: user.email });
  });
});

app.get('/api/stats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Unauthorized" });

  db.get("SELECT COUNT(*) AS total_subscribers FROM subscribers", [], (err, row) => {
    if (err) return res.status(500).json({ detail: "Database error" });
    const totalSubs = row ? row.total_subscribers : 0;
    
    // Dynamically mock customer historical growth combined with real subscriptions
    const customerGrowth = [
      { month: "Jan", customers: 120 },
      { month: "Feb", customers: 150 },
      { month: "Mar", customers: 195 },
      { month: "Apr", customers: 240 },
      { month: "May", customers: 290 },
      { month: "Jun", customers: 350 + (totalSubs * 4) } 
    ];
    
    const salesData = [
      { product: "Classic Croissant", revenue: 4500 },
      { product: "Sourdough Loaf", revenue: 8000 },
      { product: "Almond Tart", revenue: 3200 },
    ];
    
    res.json({ total_subscribers: totalSubs, growth: customerGrowth, sales: salesData });
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Node backend running on http://127.0.0.1:${PORT}`);
});
