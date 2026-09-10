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

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    })

    const response = await fetch(proxyRequest)
    const headers = new Headers(response.headers)

    Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value))

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}
