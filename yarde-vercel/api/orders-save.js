const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const { action, order, id } = req.body;

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

    if (action === 'upsert') {
      await sql`
        INSERT INTO orders (id, created, name, customer, contact, due, description, price, payment, delivery, status, notes, deposit, items)
        VALUES (
          ${order.id}, ${order.created}, ${order.name}, ${order.customer},
          ${order.contact || ''}, ${order.due || ''}, ${order.desc || ''},
          ${order.price || ''}, ${order.payment || 'unpaid'}, ${order.delivery || 'bonair'},
          ${order.status || 'ordered'}, ${order.notes || ''}, ${order.deposit || ''},
          ${order.items || '[]'}
        )
        ON CONFLICT (id) DO UPDATE SET
          name        = EXCLUDED.name,
          customer    = EXCLUDED.customer,
          contact     = EXCLUDED.contact,
          due         = EXCLUDED.due,
          description = EXCLUDED.description,
          price       = EXCLUDED.price,
          payment     = EXCLUDED.payment,
          delivery    = EXCLUDED.delivery,
          status      = EXCLUDED.status,
          notes       = EXCLUDED.notes,
          deposit     = EXCLUDED.deposit,
          items       = EXCLUDED.items
      `;
    } else if (action === 'delete') {
      await sql`DELETE FROM orders WHERE id = ${id}`;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
