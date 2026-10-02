import { NextResponse } from 'next/server'

export function isKycReference(value: string | null | undefined) {
  if (!value) return false
  return value.startsWith('kyc:') || value.startsWith('https://verify.stripe.com')
}

export function isIdentityPayload(value: string | null | undefined) {
  if (!value) return false
  return value.startsWith('data:') || value.includes('base64,')
}

export function publicDocumentView(fileUrl: string | null | undefined) {
  if (!fileUrl || isIdentityPayload(fileUrl) || isKycReference(fileUrl)) {
    return { hostedOffsite: true as const, href: null }
  }
  return { hostedOffsite: false as const, href: fileUrl }
}

export function jsonNoStore(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, private',
    },
  })
}
