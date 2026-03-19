import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'backend', 'rikhabakes.db');
const db = new sqlite3.Database(dbPath);

const products = [
  { name: "Vanilla Cloud Cake", price: "600 PESOS", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80" },
  { name: "Mint Pistachio Tart", price: "25 PESOS", image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=900&q=80" },
  { name: "Berry Bliss Cupcakes", price: "39 PESOS / box", image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=80" },
  { name: "Chocolate Fudge Cake", price: "30 PESOS", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80" },
  { name: "Butter Croissant Box", price: "450 PESOS / BOX", image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=900&q=80" },
  { name: "Pastel Macarons", price: "350 PESOS / BOX", image: "https://images.unsplash.com/photo-1457666134378-6b77915bd5f2?auto=format&fit=crop&w=900&q=80" },
  { name: "Strawberry Tart", price: "40 PESOS", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80" },
  { name: "Honey Brioche Buns", price: "80 PESOS / 6 pcs", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80" },
  { name: "Glazed Donut Mix", price: "250 PESOS / box", image: "https://images.unsplash.com/photo-1559620192-032c4bc4674e?auto=format&fit=crop&w=900&q=80" }
];

db.serialize(() => {
  db.run("DELETE FROM products"); // Clear existing
  const stmt = db.prepare("INSERT INTO products (name, price, image_url) VALUES (?, ?, ?)");
  products.forEach(p => {
    stmt.run(p.name, p.price, p.image);
  });
  stmt.finalize();
  console.log("Successfully seeded database with user products.");
});

db.close();
