import { prisma } from '@/lib/prisma'
import { createServiceClient } from '@/lib/supabase/service'
import { sendEmail } from '@/lib/utils/email'
import { bookingReference } from './status'

interface BookingNotification {
  userId: string
  bookingId: string
  title: string
  body: string
  /** Lien relatif (sans locale) vers l'espace où agir, ex. /dashboard/tourist?tab=bookings */
  actionPath: string
  actionLabel: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function getUserEmail(userId: string) {
  const supabase = createServiceClient()
  if (!supabase) return null
  const { data } = await supabase.auth.admin.getUserById(userId)
  return data?.user?.email ?? null
}

/**
 * Notification in-app + e-mail transactionnel. Ne lève jamais : une panne
 * d'envoi ne doit pas annuler une transition de réservation déjà enregistrée.
 */
export async function notifyBookingParty({ userId, bookingId, title, body, actionPath, actionLabel }: BookingNotification) {
  const reference = bookingReference(bookingId)

  try {
    await prisma.notification.create({
      data: { user_id: userId, type: 'booking', title, body, data: { booking_id: bookingId, reference } },
    })
  } catch (error) {
    console.error('[notifyBookingParty] notification', error)
  }

  try {
    const email = await getUserEmail(userId)
    if (!email) return

    const profile = await prisma.profile.findUnique({ where: { id: userId }, select: { preferred_lang: true } })
    const locale = profile?.preferred_lang && ['fr', 'en', 'es', 'zh'].includes(profile.preferred_lang) ? profile.preferred_lang : 'fr'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://heritogo.codorah.com'
    const url = `${baseUrl}/${locale}${actionPath}`

    await sendEmail({
      to: email,
      subject: `HeriTogo — ${title} (${reference})`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#FBF6EF;color:#2A1E16">
          <p style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#B5502E;margin:0 0 16px">HeriTogo</p>
          <div style="background:#FFFFFF;border:1px solid #E8DCCF;border-radius:12px;padding:24px">
            <p style="font-size:12px;color:#7A6A5C;margin:0 0 4px">Réf. ${reference}</p>
            <h1 style="font-family:Georgia,serif;font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>
            <p style="font-size:14px;line-height:1.6;margin:0 0 20px">${escapeHtml(body)}</p>
            <a href="${url}" style="display:inline-block;background:#B5502E;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 20px;border-radius:10px">${escapeHtml(actionLabel)}</a>
          </div>
          <p style="font-size:11px;color:#7A6A5C;margin:16px 0 0">Vous recevez cet e-mail car vous avez une réservation en cours sur HeriTogo.</p>
        </div>
      `,
    })
  } catch (error) {
    console.error('[notifyBookingParty] email', error)
  }
}
