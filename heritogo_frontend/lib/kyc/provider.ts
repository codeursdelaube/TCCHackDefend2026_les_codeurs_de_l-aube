type KycSession = {
  sessionId: string
  hostedUrl: string | null
  provider: 'stripe_identity' | 'external_kyc'
}

export async function createKycSession(input: {
  guideId: string
  userId: string
  returnUrl: string
}): Promise<KycSession> {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return {
      sessionId: `local_${crypto.randomUUID()}`,
      hostedUrl: null,
      provider: 'external_kyc',
    }
  }

  const body = new URLSearchParams()
  body.set('type', 'document')
  body.set('metadata[guide_id]', input.guideId)
  body.set('metadata[user_id]', input.userId)
  body.set('return_url', input.returnUrl)

  const response = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  if (!response.ok) {
    throw new Error('KYC_PROVIDER_UNAVAILABLE')
  }

  const data = (await response.json()) as { id?: string; url?: string }
  if (!data.id) throw new Error('KYC_PROVIDER_UNAVAILABLE')

  return {
    sessionId: data.id,
    hostedUrl: data.url ?? null,
    provider: 'stripe_identity',
  }
}
