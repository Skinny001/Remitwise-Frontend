import { NextRequest, NextResponse } from 'next/server';

// In-memory metrics store
const metrics: Record<string, { count: number; errorCount: number }> = {};

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const method = request.method;
  const url = request.nextUrl.pathname;

  // Generate a simple request ID
  const requestId = Math.random().toString(36).substring(2, 10);

  // Proceed with request
  let response: NextResponse;
  let statusCode = 200;
  let error = false;
  try {
    response = await NextResponse.next();
    statusCode = response.status;
  } catch (e) {
    error = true;
    statusCode = 500;
    response = new NextResponse(
      JSON.stringify({ error: 'Internal server error', message: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const durationMs = Date.now() - start;

  // Log structured JSON
  console.log(JSON.stringify({
    requestId,
    method,
    path: url,
    statusCode,
    durationMs,
    timestamp: new Date().toISOString(),
  }));

  // Update metrics
  const key = `${method} ${url}`;
  if (!metrics[key]) metrics[key] = { count: 0, errorCount: 0 };
  metrics[key].count++;
  if (error || statusCode >= 400) metrics[key].errorCount++;

  // Attach requestId to response header for correlation
  response.headers.set('X-Request-ID', requestId);

  return response;
}

export { metrics };
