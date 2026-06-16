import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const VALID_REACTIONS = ['relate', 'support', 'strong', 'notalone'];

export default async function handler(req, res) {
  // CORS
  Object.entries(CORS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const parts = url.pathname.split('/');
    const msgId = parts[parts.length - 1];

    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const reaction = body?.reaction;

    if (!VALID_REACTIONS.includes(reaction)) {
      return res.status(400).json({
        error: 'Invalid reaction'
      });
    }

    const col = `react_${reaction}`;

    const { rows } = await pool.query(
      `UPDATE messages
       SET ${col} = ${col} + 1
       WHERE id = $1 AND approved = true
       RETURNING *`,
      [msgId]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Message not found'
      });
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