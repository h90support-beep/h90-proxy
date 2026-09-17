export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing ?url= parameter', { status: 400 });
  }

  let host: string;
  try {
    host = new URL(targetUrl).hostname;
  } catch (e) {
    return new Response('Invalid URL', { status: 400 });
  }

  const allowed = [
    'cdn-2.dm8k.com',
    'starhub.pro',
    'prime-fast.sytes.net',
    'dm8k.com',
  ];

  const isAllowed = allowed.some(d => host === d || host.endsWith('.' + d));
  if (!isAllowed) {
    return new Response('Domain not allowed: ' + host, { status: 403 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
        'Accept': '*/*',
        'Referer': targetUrl,
      },
    });

    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', '*');

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (e) {
    return new Response('Proxy error: ' + (e as Error).message, { status: 502 });
  }
}
