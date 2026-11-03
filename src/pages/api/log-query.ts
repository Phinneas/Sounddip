export const prerender = false;

export async function POST({ request, locals }: { request: Request; locals: any }) {
  const env = locals.runtime.env;
  let body: {
    zip?: string;
    radius?: number;
    resultCount?: number;
    resultType?: string;
    fallbackCity?: string;
    fallbackSlug?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const zip = String(body.zip ?? '');
  const radius = Number(body.radius);
  const resultCount = Number(body.resultCount);
  const resultType = ['results', 'fallback', 'invalid'].includes(String(body.resultType))
    ? String(body.resultType)
    : null;

  if (
    !/^\d{5}$/.test(zip) ||
    ![25, 50, 100].includes(radius) ||
    !Number.isFinite(resultCount) ||
    !resultType
  ) {
    return new Response('bad payload', { status: 400 });
  }

  try {
    await env.QUERY_LOG.prepare(
      'INSERT INTO query_log (zip, radius, result_count, result_type, fallback_city, fallback_slug) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(
        zip,
        radius,
        Math.max(0, Math.min(999, Math.round(resultCount))),
        resultType,
        body.fallbackCity ?? null,
        body.fallbackSlug ?? null,
      )
      .run();
  } catch (err: any) {
    console.error('D1 write failed:', err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err), binding: !!env.QUERY_LOG, envKeys: Object.keys(env ?? {}) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(null, { status: 204 });
}