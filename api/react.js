import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const VALID_REACTIONS = ['relate','support','strong','notalone'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const { id, reaction } = body;

    if (!id || !VALID_REACTIONS.includes(reaction)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const col = `react_${reaction}`;

    const { rows } = await pool.query(
      `UPDATE messages
       SET ${col} = ${col} + 1
       WHERE id = $1 AND approved = true
       RETURNING *`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Message not found' });
    }

    return res.status(200).json(rows[0]);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Server error',
      details: err.message
    });
  }
}