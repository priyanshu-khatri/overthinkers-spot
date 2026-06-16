import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,x-admin-password'
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const password = req.headers['x-admin-password'];

    if (!process.env.ADMIN_PASSWORD) {
      return res.status(500).json({
        error: 'ADMIN_PASSWORD environment variable not configured'
      });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    // =========================
    // ADD MESSAGE
    // =========================
    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body)
          : req.body;

      const {
        emotion,
        recipient,
        content,
        section = 'general'
      } = body;

      if (!emotion || !content) {
        return res.status(400).json({
          error: 'emotion and content are required'
        });
      }

      const { rows } = await pool.query(
        `
        INSERT INTO messages
        (
          emotion,
          recipient,
          content,
          section,
          approved
        )
        VALUES ($1,$2,$3,$4,true)
        RETURNING *
        `,
        [
          emotion,
          recipient || null,
          content,
          section
        ]
      );

      return res.status(201).json({
        success: true,
        message: rows[0]
      });
    }

    // =========================
    // DELETE MESSAGE
    // =========================
    if (req.method === 'DELETE') {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body)
          : req.body;

      const { id } = body;

      if (!id) {
        return res.status(400).json({
          error: 'Message ID required'
        });
      }

      const result = await pool.query(
        `DELETE FROM messages WHERE id = $1 RETURNING id`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: 'Message not found'
        });
      }

      return res.status(200).json({
        success: true,
        deletedId: id
      });
    }

    return res.status(405).json({
      error: 'Method not allowed'
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Server error',
      details: err.message
    });
  }
}