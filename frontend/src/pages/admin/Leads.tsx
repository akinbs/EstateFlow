import { useCallback, useEffect, useState } from 'react'
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Pagination from '../../components/ui/Pagination'
import Button from '../../components/ui/Button'
import type { BadgeVariant } from '../../components/ui/Badge'
import { getAdminLeads, updateLeadStatus } from '../../services/api/adminApi'
import type { Lead, LeadStatus } from '../../types/lead'
import type { PaginationMeta } from '../../types/common'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '',          label: 'Tüm Durumlar' },
  { value: 'new',       label: 'Yeni' },
  { value: 'contacted', label: 'İletişime Geçildi' },
  { value: 'closed',    label: 'Kapatıldı' },
]

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  new:       { label: 'Yeni',               variant: 'warning' },
  contacted: { label: 'İletişime Geçildi',  variant: 'info' },
  closed:    { label: 'Kapatıldı',          variant: 'default' },
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getAdminLeads({
        page,
        limit: 20,
        status: statusFilter || undefined,
      })
      setLeads(data.data)
      setMeta(data.meta)
    } catch {
      setError('Talepler yüklenirken bir sorun oluştu.')
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  async function handleStatusChange(leadId: string, newStatus: LeadStatus) {
    setUpdatingId(leadId)
    try {
      await updateLeadStatus(leadId, newStatus)
      await fetchLeads()
    } catch {
      alert('Durum güncellenemedi. Lütfen tekrar deneyin.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={20} className="text-orange-500" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Müşteri Talepleri</h1>
            {meta && (
              <p className="mt-0.5 text-xs text-slate-400">
                {meta.total} talep
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <AlertCircle size={28} className="text-red-400" />
          <p className="text-sm text-slate-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLeads}>
            Tekrar Dene
          </Button>
        </div>
      ) : leads.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          {statusFilter ? 'Bu durumda talep bulunmuyor.' : 'Henüz talep yok.'}
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const { label, variant } =
              statusConfig[lead.status] ?? { label: lead.status, variant: 'default' as BadgeVariant }
            const isUpdating = updatingId === lead.id

            return (
              <div
                key={lead.id}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                {/* Top row: avatar + name + property + status controls */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                      {lead.name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{lead.name}</p>
                      {lead.propertyTitle && (
                        <p className="text-xs text-slate-400">{lead.propertyTitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={variant}>{label}</Badge>
                    <div className="relative">
                      {isUpdating && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2">
                          <Loader2 size={12} className="animate-spin text-slate-400" />
                        </span>
                      )}
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                        disabled={isUpdating}
                        className="rounded-lg border border-slate-200 py-1 pl-2 pr-7 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
                      >
                        <option value="new">Yeni</option>
                        <option value="contacted">İletişime Geçildi</option>
                        <option value="closed">Kapatıldı</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {lead.message && (
                  <p className="mt-3 line-clamp-3 rounded-xl bg-slate-50 px-4 py-3 text-sm italic text-slate-600">
                    "{lead.message}"
                  </p>
                )}

                {/* Meta info */}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail size={12} />
                    {lead.email}
                  </span>
                  {lead.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} />
                      {lead.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(lead.createdAt)}
                  </span>
                </div>

                {/* Notes */}
                {lead.notes && (
                  <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Not: {lead.notes}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          hasNext={meta.hasNext}
          hasPrev={meta.hasPrev}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  )
}
