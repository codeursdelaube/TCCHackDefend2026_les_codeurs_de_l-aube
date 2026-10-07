import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_CHAT_URL =
  process.env.FASTAPI_CHAT_URL ||
  'https://heritogo-backend.fastapicloud.dev/chatbot/api/v1/chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(FASTAPI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        message: body.message,
        extracted_location: body.extracted_location || 'Lomé',
        extracted_budget: typeof body.extracted_budget === 'number' ? body.extracted_budget : 500000.0,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[HériTogo Chat API] Erreur backend HTTP', response.status, errorText)
      return NextResponse.json(
        { error: 'Le service de guide virtuel est momentanément indisponible.' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[HériTogo Chat API] Erreur interne :', error)
    return NextResponse.json(
      { error: 'Impossible de contacter le conseiller virtuel.' },
      { status: 500 }
    )
  }
}
