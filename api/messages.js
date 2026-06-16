import { sql } from '@vercel/postgres';

export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const EMOTIONS = ['Anxiety','Loneliness','Hope','Heartbreak','Stress','Gratitude','Self-Doubt','Other'];
const SECTIONS = ['general','midnight','hope'];

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    // ── GET /api/messages ──
    if (req.method === 'GET') {
      const url    = new URL(req.url);
      const emotion  = url.searchParams.get('emotion');
      const section  = url.searchParams.get('section');
      const limit    = Math.min(parseInt(url.searchParams.get('limit')  || '20'), 100);
      const offset   = parseInt(url.searchParams.get('offset') || '0');

      let query = `SELECT * FROM messages WHERE approved = true`;
      const params = [];
      let i = 1;
      if (emotion && emotion !== 'All' && EMOTIONS.includes(emotion)) {
        query += ` AND emotion = $${i++}`;
        params.push(emotion);
      }
      if (section && SECTIONS.includes(section)) {
        query += ` AND section = $${i++}`;
        params.push(section);
      }
      query += ` ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`;
      params.push(limit, offset);

      const { rows } = await sql.query(query, params);
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    // ── POST /api/messages ──
    if (req.method === 'POST') {
      const body      = await req.json();
      const emotion   = (body.emotion   || '').trim();
      const recipient = (body.recipient || '').trim().slice(0, 60) || null;
      const content   = (body.content   || '').trim();
      const section   = SECTIONS.includes(body.section) ? body.section : 'general';

      if (!EMOTIONS.includes(emotion))
        return new Response(JSON.stringify({ error: 'Invalid emotion' }), { status: 400, headers: CORS });
      if (content.length < 10)
        return new Response(JSON.stringify({ error: 'Message too short (min 10 characters)' }), { status: 400, headers: CORS });
      if (content.length > 1000)
        return new Response(JSON.stringify({ error: 'Message too long (max 1000 characters)' }), { status: 400, headers: CORS });

      const { rows } = await sql`
        INSERT INTO messages (emotion, recipient, content, section)
        VALUES (${emotion}, ${recipient}, ${content}, ${section})
        RETURNING *`;

      return new Response(JSON.stringify(rows[0]), {
        status: 201,
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
}
