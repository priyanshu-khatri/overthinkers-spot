import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'nodejs'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const VALID_REACTIONS = ['relate','support','strong','notalone'];

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const url      = new URL(req.url);
    const parts    = url.pathname.split('/');
    // /api/react/[id]
    const msgId    = parts[parts.length - 1];
    const body     = await req.json();
    const reaction = body.reaction;

    if (!VALID_REACTIONS.includes(reaction))
      return new Response(JSON.stringify({ error: 'Invalid reaction' }), { status: 400, headers: CORS });

    const col = `react_${reaction}`;
    const { rows } = await sql.query(
      `UPDATE messages SET ${col} = ${col} + 1 WHERE id = $1 AND approved = true RETURNING *`,
      [msgId]
    );

    if (!rows.length)
      return new Response(JSON.stringify({ error: 'Message not found' }), { status: 404, headers: CORS });

    return new Response(JSON.stringify(rows[0]), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
}
