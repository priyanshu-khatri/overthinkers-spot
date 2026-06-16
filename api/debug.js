export default async function handler() {
  return new Response(
    JSON.stringify({
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      DATABASE_URL: !!process.env.DATABASE_URL,
      PRISMA_DATABASE_URL: !!process.env.PRISMA_DATABASE_URL
    }),
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}