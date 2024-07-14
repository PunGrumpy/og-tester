import { NextResponse } from 'next/server'

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000'

export async function cors(request: Request, response: NextResponse) {
  const origin = request.headers.get('origin') || ''

  if (!origin || origin === ALLOWED_ORIGIN) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, x-api-key'
    )
  } else {
    return new NextResponse(null, { status: 403 })
  }

  return response
}
