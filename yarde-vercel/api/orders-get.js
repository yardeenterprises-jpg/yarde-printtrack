const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        created BIGINT,
        name TEXT,
        customer TEXT,
        contact TEXT,
        due TEXT,
        description TEXT,
        price TEXT,
        payment TEXT,
        delivery TEXT,
        status TEXT,
        notes TEXT,
        deposit TEXT,
        items TEXT
      )
    `;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit TEXT`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS items TEXT`;

    const rows = await sql`SELECT * FROM orders ORDER BY created DESC`;
    res.status(200).json({ ok: true, orders: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
