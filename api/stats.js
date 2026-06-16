import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const [totalRes, emotionRes] = await Promise.all([
      pool.query(`
        SELECT COUNT(*)::int AS total
        FROM messages
        WHERE approved = true
      `),

      pool.query(`
        SELECT emotion, COUNT(*)::int AS count
        FROM messages
        WHERE approved = true
        GROUP BY emotion
      `)
    ]);

    const byEmotion = {};

    emotionRes.rows.forEach((r) => {
      byEmotion[r.emotion] = r.count;
    });

    return res.status(200).json({
      total: totalRes.rows[0].total,
      by_emotion: byEmotion
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Server error',
      details: err.message
    });
  }
}