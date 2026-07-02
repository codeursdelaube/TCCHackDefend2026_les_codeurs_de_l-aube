import { Resend } from 'resend'

// Initialisation de Resend. Si RESEND_API_KEY n'est pas configuré, on utilise une clé mockée
// ou on gère gracieusement en console afin que l'application ne plante pas.
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key_for_testing')

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn(`[EMAIL MOCK] Pas de clé RESEND_API_KEY configurée. Envoi simulé à ${to} :`, {
        subject,
        html: html.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
      })
      return { success: true, id: 'mock-id' }
    }

    const { data, error } = await resend.emails.send({
      from: 'HériTogo <onboarding@resend.dev>',
      to,
      subject,
      html
    })

    if (error) {
      console.error('[EMAIL ERROR] Erreur Resend:', error)
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[EMAIL EXCEPTION] Erreur envoi email:', err)
    return { success: false, error: err }
  }
}
