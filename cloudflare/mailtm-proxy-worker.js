const MAIL_TM_ORIGIN = 'https://api.mail.tm'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const incomingUrl = new URL(request.url)
    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, MAIL_TM_ORIGIN)

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
  },
}
