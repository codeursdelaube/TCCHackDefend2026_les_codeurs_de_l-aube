import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { GuideStatus, ReportStatus } from '@prisma/client'

// Middleware helper to check admin role
async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Non autorisé', status: 401 }
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  if (!profile || profile.role !== 'admin') {
    return { error: 'Accès interdit', status: 403 }
  }

  if (!('is_active' in profile) || (profile as { is_active?: boolean }).is_active === false) {
    return { error: 'Compte inactif', status: 403 }
  }

  return { user, profile }
}

// GET: Fetch admin dashboard statistics & details
export async function GET() {
  try {
    const auth = await checkAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // 1. Guides pending approval or under review
    const pendingGuides = await prisma.guideProfile.findMany({
      where: {
        status: { in: ['pending', 'under_review'] }
      },
      include: {
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            phone: true
          }
        },
        documents: true
      },
      orderBy: { submitted_at: 'asc' }
    })

    // 2. All guides to support suspension/banning
    const allGuides = await prisma.guideProfile.findMany({
      include: {
        profile: {
          select: {
            full_name: true,
            avatar_url: true,
            phone: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // 3. Reports
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { full_name: true }
        },
        reported_guide: {
          include: {
            profile: {
              select: { full_name: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // 4. Reviews
    const reviews = await prisma.review.findMany({
      include: {
        reviewer: {
          select: { full_name: true }
        },
        guide: {
          include: {
            profile: {
              select: { full_name: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // 5. Admin Logs
    const adminLogs = await prisma.adminLog.findMany({
      include: {
        admin: {
          select: { full_name: true }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    })

    return NextResponse.json({
      success: true,
      pendingGuides,
      allGuides,
      reports,
      reviews,
      adminLogs
    })
  } catch (error: unknown) {
    console.error('[GET /api/admin]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST: Execute Admin actions (approve_guide, reject_guide, suspend_guide, resolve_report, hide_review)
export async function POST(request: Request) {
  try {
    const auth = await checkAdmin()
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const adminUser = auth.user
    const body = await request.json()
    const { action, targetId, details } = body

    if (!action || !targetId) {
      return NextResponse.json({ error: 'action et targetId requis' }, { status: 400 })
    }

    if (action === 'approve_guide') {
      // Approver le guide
      await prisma.$transaction([
        prisma.guideProfile.update({
          where: { id: targetId },
          data: { status: 'approved' }
        }),
        prisma.guideDocument.updateMany({
          where: { guide_id: targetId },
          data: {
            is_verified: true,
            verified_by: adminUser.id,
            verified_at: new Date()
          }
        }),
        prisma.adminLog.create({
          data: {
            admin_id: adminUser.id,
            action: 'Approve Guide',
            target_type: 'guide_profile',
            target_id: targetId,
            details: details || {}
          }
        })
      ])
      
      // Récupérer le guide_profile pour avoir le user_id de la notification
      const guideProfile = await prisma.guideProfile.findUnique({ where: { id: targetId } })
      if (guideProfile) {
        await prisma.notification.create({
          data: {
            user_id: guideProfile.user_id,
            type: 'verification',
            title: 'Profil Vérifié',
            body: 'Félicitations, vos documents ont été validés ! Votre profil est maintenant public.'
          }
        })
      }
    } else if (action === 'reject_guide') {
      const reason = details?.reason || 'Non conforme aux critères'
      await prisma.$transaction([
        prisma.guideProfile.update({
          where: { id: targetId },
          data: {
            status: 'rejected',
            rejection_reason: reason
          }
        }),
        prisma.adminLog.create({
          data: {
            admin_id: adminUser.id,
            action: 'Reject Guide',
            target_type: 'guide_profile',
            target_id: targetId,
            details: { reason }
          }
        })
      ])

      const guideProfile = await prisma.guideProfile.findUnique({ where: { id: targetId } })
      if (guideProfile) {
        await prisma.notification.create({
          data: {
            user_id: guideProfile.user_id,
            type: 'verification',
            title: 'Profil Refusé',
            body: `Vos documents n'ont pas pu être validés. Motif : ${reason}`
          }
        })
      }
    } else if (action === 'suspend_guide') {
      await prisma.$transaction([
        prisma.guideProfile.update({
          where: { id: targetId },
          data: { status: 'suspended' }
        }),
        prisma.adminLog.create({
          data: {
            admin_id: adminUser.id,
            action: 'Suspend Guide',
            target_type: 'guide_profile',
            target_id: targetId,
            details: details || {}
          }
        })
      ])

      const guideProfile = await prisma.guideProfile.findUnique({ where: { id: targetId } })
      if (guideProfile) {
        await prisma.notification.create({
          data: {
            user_id: guideProfile.user_id,
            type: 'system',
            title: 'Profil Suspendu',
            body: 'Votre profil a été suspendu par les administrateurs pour non respect de notre charte.'
          }
        })
      }
    } else if (action === 'resolve_report') {
      const resolution = details?.resolution || 'resolved' // resolved or dismissed
      const note = details?.note || 'Résolu par l\'admin'
      await prisma.$transaction([
        prisma.report.update({
          where: { id: targetId },
          data: {
            status: resolution as ReportStatus,
            handled_by: adminUser.id,
            handled_at: new Date(),
            resolution_note: note
          }
        }),
        prisma.adminLog.create({
          data: {
            admin_id: adminUser.id,
            action: `Resolve Report (${resolution})`,
            target_type: 'report',
            target_id: targetId,
            details: { note }
          }
        })
      ])
    } else if (action === 'toggle_review_hidden') {
      const review = await prisma.review.findUnique({ where: { id: targetId } })
      if (!review) {
        return NextResponse.json({ error: 'Avis introuvable' }, { status: 404 })
      }
      
      const newHidden = !review.is_hidden
      const reason = details?.reason || 'Décision modérateur'

      await prisma.$transaction([
        prisma.review.update({
          where: { id: targetId },
          data: {
            is_hidden: newHidden,
            hidden_reason: newHidden ? reason : null
          }
        }),
        prisma.adminLog.create({
          data: {
            admin_id: adminUser.id,
            action: newHidden ? 'Hide Review' : 'Unhide Review',
            target_type: 'review',
            target_id: targetId,
            details: { reason }
          }
        })
      ])
    } else {
      return NextResponse.json({ error: 'Action administrative inconnue' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('[POST /api/admin]', error)
    const message = error instanceof Error && error.message.includes('P1001')
      ? 'Erreur de chargement. Vérifiez votre connexion.'
      : 'Une erreur est survenue. Veuillez réessayer.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
