const express = require('express'), Database = require('better-sqlite3'), fs = require('fs');
const db = new Database('pawfect.db'); db.exec(fs.readFileSync(__dirname + '/schema.sql', 'utf8'));
const app = express(); app.use(express.json()); app.use(express.static('public'));
const BASES = ['Rice', 'Millet', 'Sweet potato'], DISCOUNT = { 7: 0, 14: 5, 30: 10 };
const ACT = { low: 1.2, normal: 1.6, high: 2.0 };

// Business logic: daily calories via Resting Energy Requirement (70 * kg^0.75) x activity factor
const dailyKcal = (kg, act) => Math.round(70 * Math.pow(kg, 0.75) * (ACT[act] || 1.6));

function quote({ mealId, addOnIds = [], planDays = 7, mealsPerDay = 2, kcal }) {
  const meal = db.prepare('SELECT * FROM meals WHERE id=?').get(mealId);
  if (!meal || !(planDays in DISCOUNT)) throw new Error('Invalid meal or plan');
  const addOns = addOnIds.length ? db.prepare(`SELECT * FROM add_ons WHERE id IN (${addOnIds.map(() => '?').join(',')})`).all(...addOnIds) : [];
  const perMeal = meal.price_per_meal + addOns.reduce((s, a) => s + a.price, 0);
  const subtotal = perMeal * mealsPerDay * planDays;
  const discount = Math.round(subtotal * DISCOUNT[planDays] / 100);
  const gramsPerMeal = kcal ? Math.round((kcal / mealsPerDay) / (meal.kcal_per_100g / 100)) : null;
  return { meal, addOns, perMeal, subtotal, discount, total: subtotal - discount, gramsPerMeal };
}

app.get('/api/catalog', (_, res) => res.json({ meals: db.prepare('SELECT * FROM meals').all(), addOns: db.prepare('SELECT * FROM add_ons').all(), bases: BASES, plans: DISCOUNT }));
app.post('/api/recommend', (req, res) => {
  const { weight_kg, activity } = req.body;
  if (!(weight_kg > 0 && weight_kg < 100)) return res.status(400).json({ error: 'Enter a valid weight (kg)' });
  res.json({ daily_kcal: dailyKcal(weight_kg, activity) });
});
app.post('/api/quote', (req, res) => { try { res.json(quote(req.body)); } catch (e) { res.status(400).json({ error: e.message }); } });

app.post('/api/orders', (req, res) => {
  try {
    const { customer, dog, mealId, base, addOnIds = [], planDays, mealsPerDay = 2, address } = req.body;
    if (!customer?.name || !address) return res.status(400).json({ error: 'Name and address required' });
    const kcal = dailyKcal(dog.weight_kg, dog.activity), q = quote({ mealId, addOnIds, planDays, mealsPerDay, kcal });
    const place = db.transaction(() => {
      const c = db.prepare('INSERT INTO customers(name,phone) VALUES(?,?)').run(customer.name, customer.phone || '').lastInsertRowid;
      const d = db.prepare('INSERT INTO dogs(customer_id,name,weight_kg,activity,allergies,daily_kcal) VALUES(?,?,?,?,?,?)').run(c, dog.name, dog.weight_kg, dog.activity, dog.allergies || '', kcal).lastInsertRowid;
      const o = db.prepare('INSERT INTO orders(customer_id,dog_id,meal_id,base,plan_days,meals_per_day,grams_per_meal,subtotal,discount,total,address) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
        .run(c, d, mealId, base, planDays, mealsPerDay, q.gramsPerMeal, q.subtotal, q.discount, q.total, address).lastInsertRowid;
      addOnIds.forEach(id => db.prepare('INSERT INTO order_add_ons VALUES(?,?)').run(o, id));
      return o;
    })();
    res.status(201).json({ orderId: place, total: q.total });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Order tracking: status simulated from elapsed time (demo). Real: ops-driven status column.
app.get('/api/orders/:id', (req, res) => {
  const o = db.prepare(`SELECT o.*, m.name meal, d.name dog FROM orders o JOIN meals m ON m.id=o.meal_id JOIN dogs d ON d.id=o.dog_id WHERE o.id=?`).get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  const mins = (Date.now() - new Date(o.created_at + 'Z')) / 60000;
  o.status = mins < 1 ? 'Placed' : mins < 3 ? 'Preparing' : mins < 5 ? 'Out for delivery' : 'Delivered';
  res.json(o);
});

// Analytics: event ingestion + funnel (the PM dashboard)
app.post('/api/events', (req, res) => { const { session_id, name, props } = req.body; db.prepare('INSERT INTO events(session_id,name,props) VALUES(?,?,?)').run(session_id, name, JSON.stringify(props || {})); res.sendStatus(204); });
app.get('/api/metrics', (_, res) => {
  const steps = ['view_home', 'dog_profile_done', 'meal_selected', 'checkout_started', 'order_placed'];
  const funnel = steps.map(s => ({ step: s, sessions: db.prepare('SELECT COUNT(DISTINCT session_id) n FROM events WHERE name=?').get(s).n }));
  funnel.forEach((f, i) => f.conv_from_prev = i && funnel[i - 1].sessions ? +(100 * f.sessions / funnel[i - 1].sessions).toFixed(1) : 100);
  const r = db.prepare('SELECT COUNT(*) orders, COALESCE(SUM(total),0) gmv, COALESCE(AVG(total),0) aov, COALESCE(AVG(plan_days),0) avg_plan FROM orders').get();
  res.json({ funnel, ...r, aov: Math.round(r.aov) });
});
app.listen(process.env.PORT || 3000, () => console.log('Pawfect Bowl on :3000'));
