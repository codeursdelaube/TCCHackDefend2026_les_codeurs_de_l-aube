'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/immutability, react/no-unescaped-entities, prefer-const */

import { useEffect, useState, startTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLORS } from '@/lib/constants/colors'
import { getInitials } from '@/lib/auth/redirect'
import { useTranslations } from 'next-intl'
import { apiFetch } from '@/lib/utils/http'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { 
  ShieldCheck, Users, AlertTriangle, MessageSquare, History, 
  Loader2, FileText, Ban, EyeOff, Eye, ExternalLink 
} from 'lucide-react'

interface PendingGuide {
  id: string
  experience_years: number
  status: string
  submitted_at: string
  profile: {
    full_name: string
    phone?: string
  }
  documents: {
    id: string
    type: string
    label: string
    file_url: string
  }[]
}

interface AllGuideRow {
  id: string
  status: string
  avg_rating: string
  total_missions: number
  profile: {
    full_name: string
  }
}

interface ReportRow {
  id: string
  reason: string
  description: string
  status: string
  created_at: string
  reporter: {
    full_name: string
  }
  reported_guide?: {
    profile: {
      full_name: string
    }
  }
}

interface ReviewRow {
  id: string
  rating_overall: number
  comment?: string
  is_hidden: boolean
  hidden_reason?: string
  created_at: string
  reviewer: {
    full_name: string
  }
  guide: {
    profile: {
      full_name: string
    }
  }
}

interface AdminLog {
  id: string
  action: string
  target_type: string
  target_id?: string
  created_at: string
  details: any
  admin: {
    full_name: string
  }
}

export default function AdminDashboardPage() {
  const params = useParams<{ locale: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations('Dashboard')

  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'reviews' | 'logs'>('pending')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'guides' || tab === 'bans' || tab === 'pending') {
      setActiveTab('pending')
    } else if (tab === 'reports') {
      setActiveTab('reports')
    } else if (tab === 'reviews') {
      setActiveTab('reviews')
    } else if (tab === 'logs') {
      setActiveTab('logs')
    }
  }, [searchParams])

  const handleTabChange = (tabName: 'pending' | 'reports' | 'reviews' | 'logs') => {
    setActiveTab(tabName)
    startTransition(() => {
      let newTabParam = tabName === 'pending' ? 'guides' : tabName
      window.history.pushState(null, '', `?tab=${newTabParam}`)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
  }
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // API Data
  const [pendingGuides, setPendingGuides] = useState<PendingGuide[]>([])
  const [allGuides, setAllGuides] = useState<AllGuideRow[]>([])
  const [reports, setReports] = useState<ReportRow[]>([])
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])

  // Action states
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionGuideId, setRejectionGuideId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [hideReviewId, setHideReviewId] = useState<string | null>(null)
  const [hideReviewReason, setHideReviewReason] = useState('')

  const checkAccess = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        window.location.href = `/${params.locale}/auth/login`
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        alert(getUserFriendlyError(profileError))
        setLoading(false)
        return
      }

      if (profile?.role !== 'admin') {
        window.location.href = `/${params.locale}/dashboard`
        return
      }
      setIsAdmin(true)
      await loadAdminData()
    } catch (err: unknown) {
      console.error('Erreur acces admin:', err)
      alert(getUserFriendlyError(err))
      setLoading(false)
    }
  }

  const loadAdminData = async () => {
    try {
      const result = await apiFetch<{
        pendingGuides?: PendingGuide[]
        allGuides?: AllGuideRow[]
        reports?: ReportRow[]
        reviews?: ReviewRow[]
        adminLogs?: AdminLog[]
      }>('/api/admin')

      if (result.ok && result.data) {
        setPendingGuides(result.data.pendingGuides || [])
        setAllGuides(result.data.allGuides || [])
        setReports(result.data.reports || [])
        setReviews(result.data.reviews || [])
        setLogs(result.data.adminLogs || [])
      } else if (result.error) {
        alert(result.error)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données admin:', err)
      alert(t('common.error_network'))
    } finally {
      setLoading(false)
    }
  }

  const runAdminAction = async (payload: Record<string, unknown>, fallbackError: string) => {
    const result = await apiFetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!result.ok) {
      alert(result.error || fallbackError)
      return false
    }

    await loadAdminData()
    return true
  }

  useEffect(() => {
    checkAccess()
  }, [params.locale])

  const handleApproveGuide = async (guideId: string) => {
    if (!confirm(t('admin.confirm_approve'))) return
    setActionLoading(true)
    try {
      await runAdminAction({ action: 'approve_guide', targetId: guideId }, t('admin.error_approve'))
    } catch {
      alert(t('common.error_network'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectGuide = async () => {
    if (!rejectionGuideId || !rejectionReason.trim()) return
    setActionLoading(true)
    try {
      const ok = await runAdminAction({
        action: 'reject_guide',
        targetId: rejectionGuideId,
        details: { reason: rejectionReason }
      }, t('admin.error_reject'))
      if (ok) {
        setRejectionGuideId(null)
        setRejectionReason('')
      }
    } catch {
      alert(t('common.error_network'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspendGuide = async (guideId: string) => {
    if (!confirm(t('admin.confirm_suspend'))) return
    setActionLoading(true)
    try {
      await runAdminAction({ action: 'suspend_guide', targetId: guideId }, t('admin.error_suspend'))
    } catch {
      alert(t('common.error_network'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolveReport = async (reportId: string, resolution: 'resolved' | 'dismissed') => {
    const promptText = t('admin.resolve_prompt')
    const defaultText = t('admin.resolve_default')
    const note = prompt(promptText) || defaultText
    setActionLoading(true)
    try {
      await runAdminAction({
        action: 'resolve_report',
        targetId: reportId,
        details: { resolution, note }
      }, t('admin.error_resolve'))
    } catch {
      alert(t('common.error_network'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleReviewHidden = async () => {
    if (!hideReviewId) return
    setActionLoading(true)
    try {
      const ok = await runAdminAction({
        action: 'toggle_review_hidden',
        targetId: hideReviewId,
        details: { reason: hideReviewReason }
      }, t('admin.error_toggle_hidden'))
      if (ok) {
        setHideReviewId(null)
        setHideReviewReason('')
      }
    } catch {
      alert(t('common.error_network'))
    } finally {
      setActionLoading(false)
    }
  }

  const quickToggleReview = async (reviewId: string) => {
    setActionLoading(true)
    try {
      await runAdminAction({
        action: 'toggle_review_hidden',
        targetId: reviewId,
        details: { reason: 'Action rapide modérateur' }
      }, t('admin.error_toggle_hidden'))
    } catch {
      alert(t('common.error_network'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" style={{ color: COLORS.forest }} />
          <p className="text-sm font-semibold text-base-content/60">{t('common.loading_rights')}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-24 text-base-content sm:px-6 lg:px-8 bg-base-100">
      
      {/* Title block */}
      <div className="mb-8 border-b border-border pb-5">
        <span 
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white"
          style={{ backgroundColor: COLORS.rust }}
        >
          {t('admin.console_title')}
        </span>
        <h1 className="mt-3 font-serif text-3xl font-bold sm:text-4xl text-base-content">
          {t('admin.general_admin')}
        </h1>
        <p className="mt-2 text-xs text-base-content/65 leading-5 max-w-2xl font-semibold">
          {t('admin.admin_subtitle')}
        </p>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-base-200 border border-border p-4 shadow-xs">
          <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">{t('admin.stat_exam')}</p>
          <p className="text-2xl font-black text-base-content mt-1">
            {pendingGuides.filter(g => g.status === 'under_review').length}
          </p>
        </div>
        <div className="rounded-2xl bg-base-200 border border-border p-4 shadow-xs">
          <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">{t('admin.stat_reports')}</p>
          <p className="text-2xl font-black text-error mt-1">
            {reports.filter(r => r.status === 'open').length}
          </p>
        </div>
        <div className="rounded-2xl bg-base-200 border border-border p-4 shadow-xs">
          <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">{t('admin.stat_reviews')}</p>
          <p className="text-2xl font-black text-base-content mt-1">{reviews.length}</p>
        </div>
        <div className="rounded-2xl bg-base-200 border border-border p-4 shadow-xs">
          <p className="text-[10px] font-black uppercase text-base-content/40 tracking-wider">{t('admin.stat_total')}</p>
          <p className="text-2xl font-black text-base-content mt-1">{allGuides.length}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border mb-8 overflow-x-auto gap-4">
        {[
          { id: 'pending', label: t('admin.tab_validation'), icon: ShieldCheck },
          { id: 'reports', label: t('admin.tab_reports'), icon: AlertTriangle },
          { id: 'reviews', label: t('admin.tab_reviews'), icon: MessageSquare },
          { id: 'logs', label: t('admin.tab_logs'), icon: History }
        ].map((tabItem) => {
          const Icon = tabItem.icon
          return (
            <button
              key={tabItem.id}
              onClick={() => handleTabChange(tabItem.id as any)}
              className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tabItem.id 
                  ? 'border-primary text-primary font-black' 
                  : 'border-transparent text-base-content/60 hover:text-base-content'
              }`}
              style={{ borderBottomColor: activeTab === tabItem.id ? COLORS.forest : undefined, color: activeTab === tabItem.id ? COLORS.forest : undefined }}
            >
              <Icon className="h-4.5 w-4.5" />
              {tabItem.label}
            </button>
          )
        })}
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">

        {/* Tab 1: Validation of Guides */}
        {activeTab === 'pending' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-lg font-bold mb-4">{t('admin.pending_title')}</h3>
              
              {pendingGuides.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-base-200 p-8 text-center text-base-content/50 font-semibold">
                  {t('admin.no_pending')}
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingGuides.map(g => (
                    <div key={g.id} className="rounded-3xl border border-border bg-base-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 bg-neutral text-neutral-content rounded-xl flex items-center justify-center font-black">
                            {getInitials(g.profile.full_name)}
                          </div>
                          <div>
                            <h4 className="font-bold text-base-content text-sm">{g.profile.full_name}</h4>
                            <p className="text-[10px] text-base-content/65 font-bold">
                              {t('admin.exp_status_label', { years: g.experience_years })}<span className="text-amber-600 font-extrabold uppercase">{g.status}</span>
                            </p>
                          </div>
                        </div>

                        {/* Documents list */}
                        <div className="space-y-2 border-t border-border/55 pt-3">
                          <span className="block text-[10px] font-black uppercase text-base-content/40 tracking-wider">{t('admin.docs_provided')}</span>
                          <div className="flex flex-wrap gap-2">
                            {g.documents.map(doc => (
                              <a 
                                key={doc.id}
                                href={doc.file_url}
                                download={`${doc.label.replace(/\s+/g, '_') || 'document'}.pdf`}
                                className="badge bg-base-100 border-border text-base-content hover:border-primary py-3 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-semibold"
                              >
                                <FileText className="h-3.5 w-3.5 text-base-content/40" />
                                {doc.label} ({t('admin.download_pdf')}) <ExternalLink className="h-3 w-3 shrink-0 text-base-content/30" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0 w-full md:w-auto self-end md:self-center">
                        <button
                          onClick={() => setRejectionGuideId(g.id)}
                          className="btn btn-outline btn-error btn-sm rounded-xl flex-1 md:flex-initial text-xs font-bold"
                        >
                          {t('common.reject')}
                        </button>
                        <button
                          onClick={() => handleApproveGuide(g.id)}
                          className="btn btn-sm text-white rounded-xl border-none font-bold flex-1 md:flex-initial"
                          style={{ backgroundColor: COLORS.forest }}
                        >
                          {t('common.approve')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List of all guides */}
            <div className="border-t border-border/55 pt-6">
              <h3 className="font-serif text-lg font-bold mb-4">{t('admin.manage_guides')}</h3>
              <div className="overflow-x-auto rounded-[24px] border border-border bg-base-200">
                <table className="table w-full text-xs font-semibold">
                  <thead>
                    <tr className="bg-base-300 text-left text-[10px] font-black uppercase text-base-content/60">
                      <th className="p-4 rounded-tl-[24px]">{t('admin.table_name')}</th>
                      <th className="p-4">{t('admin.table_status')}</th>
                      <th className="p-4">{t('admin.table_rating')}</th>
                      <th className="p-4">{t('admin.table_missions')}</th>
                      <th className="p-4 rounded-tr-[24px] text-right">{t('admin.table_actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allGuides.map(g => (
                      <tr key={g.id} className="border-b border-border/60 hover:bg-base-100/40">
                        <td className="p-4 font-bold">{g.profile.full_name}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase ${
                            g.status === 'approved' ? 'bg-success/20 text-success' :
                            g.status === 'suspended' ? 'bg-red-500/20 text-error' :
                            'bg-neutral/20 text-neutral-content'
                          }`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="p-4">{Number(g.avg_rating).toFixed(1)}</td>
                        <td className="p-4">{g.total_missions}</td>
                        <td className="p-4 text-right">
                          {g.status !== 'suspended' && (
                            <button 
                              onClick={() => handleSuspendGuide(g.id)}
                              className="text-xs text-error font-bold flex items-center gap-1 ml-auto hover:underline"
                            >
                              <Ban className="h-3.5 w-3.5" /> {t('admin.suspend')}
                            </button>
                          )}
                          {g.status === 'suspended' && (
                            <button 
                              onClick={() => handleApproveGuide(g.id)}
                              className="text-xs text-primary font-bold ml-auto hover:underline"
                              style={{ color: COLORS.forest }}
                            >
                              {t('admin.reactivate')}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold mb-2">{t('admin.reports_title')}</h3>
            
            {reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-base-200 p-8 text-center text-base-content/50 font-semibold">
                {t('admin.no_reports')}
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map(r => (
                  <div key={r.id} className="rounded-3xl border border-border bg-base-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`badge badge-sm font-bold text-white uppercase text-[8px] rounded-lg ${
                            r.status === 'open' ? 'bg-error' : 'bg-neutral'
                          }`}>
                            {r.status}
                          </span>
                          <h4 className="font-bold text-base-content text-base mt-1">
                            {t('admin.report_reason', { reason: r.reason })}
                          </h4>
                        </div>
                        <span className="text-[10px] text-base-content/40 font-bold">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="text-xs text-base-content/75 font-semibold space-y-1">
                        <p>{t('admin.reporter')}<span className="text-base-content">{r.reporter.full_name}</span></p>
                        {r.reported_guide && (
                          <p>{t('admin.reported_guide')}<span className="text-error">{r.reported_guide.profile.full_name}</span></p>
                        )}
                      </div>

                      <div className="rounded-2xl bg-base-100 border border-border/60 p-3.5 text-xs text-base-content/85">
                        <span className="block font-black text-[9px] uppercase tracking-wider text-base-content/40 mb-1">{t('admin.description_label')}</span>
                        "{r.description}"
                      </div>
                    </div>

                    {r.status === 'open' && (
                      <div className="flex gap-2 border-t border-border/60 pt-4 self-end w-full sm:w-auto">
                        <button
                          onClick={() => handleResolveReport(r.id, 'dismissed')}
                          className="btn btn-outline btn-sm rounded-xl text-xs font-bold flex-1 sm:flex-initial"
                        >
                          {t('admin.reject_report')}
                        </button>
                        <button
                          onClick={() => handleResolveReport(r.id, 'resolved')}
                          className="btn btn-sm text-white rounded-xl border-none font-bold flex-1 sm:flex-initial bg-success hover:bg-success-content"
                        >
                          {t('admin.resolve_report')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reviews moderation */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold mb-2">{t('admin.reviews_title')}</h3>
            
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-base-200 p-8 text-center text-base-content/50 font-semibold">
                {t('admin.no_reviews')}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="rounded-3xl border border-border bg-base-200 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: r.rating_overall }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-base-content/40 font-bold">{new Date(r.created_at).toLocaleDateString()}</span>
                        {r.is_hidden && (
                          <span className="badge badge-error badge-xs py-2 text-[8px] font-extrabold uppercase rounded-md text-white">{t('admin.hidden')}</span>
                        )}
                      </div>

                      <p className="text-xs text-base-content/65 font-bold">
                        {t('admin.review_author', { reviewer: r.reviewer.full_name, guide: r.guide.profile.full_name })}
                      </p>

                      <div className="rounded-2xl bg-base-100 border border-border/60 p-3 text-xs text-base-content italic">
                        "{r.comment || t('admin.no_comment')}"
                      </div>

                      {r.is_hidden && r.hidden_reason && (
                        <p className="text-[10px] font-bold text-error">
                          {t('admin.hidden_reason_label', { reason: r.hidden_reason })}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 self-end sm:self-center">
                      {r.is_hidden ? (
                        <button
                          onClick={() => quickToggleReview(r.id)}
                          className="btn btn-outline btn-sm rounded-xl text-xs font-bold gap-1"
                        >
                          <ShieldCheck className="h-4 w-4" /> {t('admin.make_public')}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setHideReviewId(r.id)
                          }}
                          className="btn btn-outline btn-error btn-sm rounded-xl text-xs font-bold gap-1"
                        >
                          <EyeOff className="h-4 w-4" /> {t('admin.hide_review')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold mb-2">{t('admin.logs_title')}</h3>
            
            <div className="overflow-x-auto rounded-[24px] border border-border bg-base-200">
              <table className="table w-full text-xs font-semibold">
                <thead>
                  <tr className="bg-base-300 text-left text-[10px] font-black uppercase text-base-content/60">
                    <th className="p-4 rounded-tl-[24px]">{t('admin.table_date')}</th>
                    <th className="p-4">{t('admin.table_admin')}</th>
                    <th className="p-4">{t('admin.table_action')}</th>
                    <th className="p-4">{t('admin.table_target')}</th>
                    <th className="p-4 rounded-tr-[24px]">{t('admin.table_details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b border-border/60 hover:bg-base-100/40">
                      <td className="p-4">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-4 font-bold">{log.admin.full_name}</td>
                      <td className="p-4 font-black">{log.action}</td>
                      <td className="p-4">{log.target_type}{log.target_id ? ` (${log.target_id.slice(0, 8)})` : ''}</td>
                      <td className="p-4 text-base-content/65">{JSON.stringify(log.details)}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-base-content/50">{t('admin.no_logs')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Reject Guide Modal */}
      {rejectionGuideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-base-200 p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-base-content">{t('admin.reject_modal_title')}</h3>
            <p className="text-xs text-base-content/60">
              {t('admin.reject_modal_subtitle')}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('admin.reject_modal_placeholder')}
              className="textarea textarea-bordered h-24 w-full rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
              required
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectionGuideId(null)
                  setRejectionReason('')
                }}
                className="btn btn-outline flex-1 rounded-2xl text-xs font-bold"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleRejectGuide}
                disabled={actionLoading || !rejectionReason.trim()}
                className="btn flex-1 rounded-2xl border-none text-xs font-bold text-white"
                style={{ backgroundColor: COLORS.rust }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.reject_guide_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Review Modal */}
      {hideReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] border border-border bg-base-200 p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-base-content">{t('admin.hide_modal_title')}</h3>
            <p className="text-xs text-base-content/60">
              {t('admin.hide_modal_subtitle')}
            </p>
            <textarea
              value={hideReviewReason}
              onChange={(e) => setHideReviewReason(e.target.value)}
              placeholder={t('admin.hide_modal_placeholder')}
              className="textarea textarea-bordered h-24 w-full rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
              required
            />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setHideReviewId(null)
                  setHideReviewReason('')
                }}
                className="btn btn-outline flex-1 rounded-2xl text-xs font-bold"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleToggleReviewHidden}
                disabled={actionLoading || !hideReviewReason.trim()}
                className="btn flex-1 rounded-2xl border-none text-xs font-bold text-white"
                style={{ backgroundColor: COLORS.rust }}
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('admin.hide_review')}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
