import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  const password = req.headers['x-admin-password'];

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  try {

    // ADD MESSAGE
    if (req.method === 'POST') {

      const {
        emotion,
        recipient,
        content,
        section
      } = req.body;

      const { rows } = await pool.query(
        `INSERT INTO messages
        (emotion, recipient, content, section, approved)
        VALUES ($1,$2,$3,$4,true)
        RETURNING *`,
        [
          emotion,
          recipient || null,
          content,
          section
        ]
      );

      return res.status(201).json(rows[0]);
    }

    // DELETE MESSAGE
    if (req.method === 'DELETE') {

      const { id } = req.body;

      await pool.query(
        'DELETE FROM messages WHERE id = $1',
        [id]
      );

      return res.status(200).json({
        success: true
      });
    }

    // LIST RECENT MESSAGES
    if (req.method === 'GET') {

      const { rows } = await pool.query(
        `SELECT *
         FROM messages
         ORDER BY created_at DESC
         LIMIT 50`
      );

      return res.status(200).json(rows);
    }

    return res.status(405).json({
      error: 'Method not allowed'
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
}