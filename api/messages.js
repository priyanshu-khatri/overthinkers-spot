import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EMOTIONS = [
  'Anxiety',
  'Loneliness',
  'Hope',
  'Heartbreak',
  'Stress',
  'Gratitude',
  'Self-Doubt',
  'Other'
];

const SECTIONS = ['general', 'midnight', 'hope'];

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    // GET
    if (req.method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host}`);

      const emotion = url.searchParams.get('emotion');
      const section = url.searchParams.get('section');

      const limit = Math.min(
        parseInt(url.searchParams.get('limit') || '20'),
        100
      );

      const offset = parseInt(
        url.searchParams.get('offset') || '0'
      );

      let query = `
        SELECT *
        FROM messages
        WHERE approved = true
      `;

      const params = [];
      let i = 1;

      if (
        emotion &&
        emotion !== 'All' &&
        EMOTIONS.includes(emotion)
      ) {
        query += ` AND emotion = $${i++}`;
        params.push(emotion);
      }

      if (
        section &&
        SECTIONS.includes(section)
      ) {
        query += ` AND section = $${i++}`;
        params.push(section);
      }

      query += `
        ORDER BY created_at DESC
        LIMIT $${i++}
        OFFSET $${i++}
      `;

      params.push(limit, offset);

      const { rows } = await pool.query(query, params);

      return res.status(200).json(rows);
    }

    // POST
    if (req.method === 'POST') {
      const body =
        typeof req.body === 'string'
          ? JSON.parse(req.body)
          : req.body;

      const emotion = (body.emotion || '').trim();
      const recipient =
        (body.recipient || '')
          .trim()
          .slice(0, 60) || null;

      const content = (body.content || '').trim();

      const section =
        SECTIONS.includes(body.section)
          ? body.section
          : 'general';

      if (!EMOTIONS.includes(emotion)) {
        return res.status(400).json({
          error: 'Invalid emotion'
        });
      }

      if (content.length < 10) {
        return res.status(400).json({
          error: 'Message too short (min 10 characters)'
        });
      }

      if (content.length > 1000) {
        return res.status(400).json({
          error: 'Message too long (max 1000 characters)'
        });
      }

      const { rows } = await pool.query(
        `
        INSERT INTO messages
        (emotion, recipient, content, section)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [emotion, recipient, content, section]
      );

      return res.status(201).json(rows[0]);
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