export async function logIP(pool, messageId, req) {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';

    await pool.query(
      `
      INSERT INTO message_logs
      (message_id, ip_address)
      VALUES ($1, $2)
      `,
      [messageId, ip]
    );

  } catch (err) {
    console.error('IP Logger Error:', err);
  }
}