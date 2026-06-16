import { sql } from '@vercel/postgres';


const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    const [totalRes, emotionRes] = await Promise.all([
      sql`SELECT COUNT(*)::int AS total FROM messages WHERE approved = true`,
      sql`SELECT emotion, COUNT(*)::int AS count FROM messages WHERE approved = true GROUP BY emotion`
    ]);

    const byEmotion = {};
    emotionRes.rows.forEach(r => { byEmotion[r.emotion] = r.count; });

    return new Response(JSON.stringify({
      total: totalRes.rows[0].total,
      by_emotion: byEmotion
    }), { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
}
