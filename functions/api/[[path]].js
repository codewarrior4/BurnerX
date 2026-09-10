const MAIL_TM_ORIGIN = 'https://api.mail.tm'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function onRequest({ request, params }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const incomingUrl = new URL(request.url)
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path || ''
  const targetUrl = new URL(`/${path}${incomingUrl.search}`, MAIL_TM_ORIGIN)

  const headers = new Headers(request.headers)
  headers.delete('host')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'follow',
  })

  const responseHeaders = new Headers(response.headers)
  Object.entries(corsHeaders).forEach(([key, value]) => responseHeaders.set(key, value))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}
