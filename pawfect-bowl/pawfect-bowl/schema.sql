-- DATA MODEL (SQLite; maps 1:1 to Postgres)
CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY, name TEXT, phone TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS dogs(id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id),
  name TEXT NOT NULL, weight_kg REAL NOT NULL, activity TEXT CHECK(activity IN('low','normal','high')),
  allergies TEXT DEFAULT '', daily_kcal INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS meals(id INTEGER PRIMARY KEY, slug TEXT UNIQUE, name TEXT, protein TEXT,
  price_per_meal INTEGER, kcal_per_100g INTEGER, ingredients TEXT);
CREATE TABLE IF NOT EXISTS add_ons(id INTEGER PRIMARY KEY, name TEXT UNIQUE, price INTEGER);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id),
  dog_id INTEGER REFERENCES dogs(id), meal_id INTEGER REFERENCES meals(id), base TEXT,
  plan_days INTEGER, meals_per_day INTEGER, grams_per_meal INTEGER, subtotal INTEGER, discount INTEGER,
  total INTEGER, payment_status TEXT DEFAULT 'test_paid', address TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS order_add_ons(order_id INTEGER REFERENCES orders(id), add_on_id INTEGER REFERENCES add_ons(id), PRIMARY KEY(order_id, add_on_id));
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, session_id TEXT, name TEXT, props TEXT, ts TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
INSERT OR IGNORE INTO meals(id,slug,name,protein,price_per_meal,kcal_per_100g,ingredients) VALUES
 (1,'chicken','Chicken Bowl','Chicken',249,130,'Chicken, carrot, spinach, rice, flaxseed'),
 (2,'fish','Fish Bowl','Fish',279,120,'Fish, pumpkin, peas, sweet potato, fish oil'),
 (3,'lamb','Lamb Bowl','Lamb',329,140,'Lamb, beetroot, green beans, millet');
INSERT OR IGNORE INTO add_ons(id,name,price) VALUES (1,'Pumpkin',20),(2,'Boiled egg',25),(3,'Fish oil',30),(4,'Probiotic',35);
