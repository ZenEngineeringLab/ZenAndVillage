import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet'
import { httpClient } from '@/shared/api/http-client'
import { AdminGuard } from '../components/AdminGuard'

interface Subscription {
  id: string
  tenantId: string
  planId: string
  requestedByCognitoSub: string
  requestedAt: string
  billingCycle: 'monthly' | 'annual'
  status: string
  rejectionReason?: string
  approvedBy?: string
  rejectedBy?: string
  startsAt?: string
}

type ActionType = 'approve' | 'reject' | null

export function AdminSubscriptionsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null)
  const [actionType, setActionType] = useState<ActionType>(null)

  // Approve form state
  const [approveStatus, setApproveStatus] = useState<'trial' | 'active'>('trial')

  // Reject form state
  const [rejectionReason, setRejectionReason] = useState('')

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ['admin', 'subscriptions'],
    queryFn: async () => {
      const res = await httpClient.get('/v1/admin/subscriptions')
      return res.data.items ?? res.data
    },
    staleTime: 30_000,
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'trial' | 'active' }) => {
      await httpClient.post(`/v1/subscriptions/${id}/approve`, { status })
    },
    onSuccess: () => {
      toast.success(t('onboarding.admin.subscriptions.approveSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      closeSheet()
    },
    onError: (err: any) => {
      toast.error(err?.message ?? t('toast.error'))
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, rejectionReason }: { id: string; rejectionReason: string }) => {
      await httpClient.post(`/v1/subscriptions/${id}/reject`, { rejectionReason })
    },
    onSuccess: () => {
      toast.success(t('onboarding.admin.subscriptions.rejectSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      closeSheet()
    },
    onError: (err: any) => {
      toast.error(err?.message ?? t('toast.error'))
    },
  })

  const filtered =
    statusFilter === 'all'
      ? subscriptions
      : statusFilter === 'pending'
      ? subscriptions.filter((s) => s.status === 'pending_approval')
      : statusFilter === 'approved'
      ? subscriptions.filter((s) => s.status === 'trial' || s.status === 'active')
      : subscriptions.filter((s) => s.status === 'rejected')

  const openAction = (sub: Subscription, type: ActionType) => {
    setSelectedSub(sub)
    setActionType(type)
    setApproveStatus('trial')
    setRejectionReason('')
  }

  const closeSheet = () => {
    setSelectedSub(null)
    setActionType(null)
  }

  const handleApprove = () => {
    if (!selectedSub) return
    approveMutation.mutate({ id: selectedSub.id, status: approveStatus })
  }

  const handleReject = () => {
    if (!selectedSub || rejectionReason.trim().length < 20) return
    rejectMutation.mutate({ id: selectedSub.id, rejectionReason: rejectionReason.trim() })
  }

  const filterTabs = [
    { key: 'all', label: t('onboarding.admin.subscriptions.filterAll') },
    { key: 'pending', label: t('onboarding.admin.subscriptions.filterPending') },
    { key: 'approved', label: t('onboarding.admin.subscriptions.filterApproved') },
    { key: 'rejected', label: t('onboarding.admin.subscriptions.filterRejected') },
  ]

  return (
    <AdminGuard>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{t('onboarding.admin.subscriptions.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('onboarding.admin.subscriptions.subtitle')}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            {t('onboarding.admin.subscriptions.empty')}
          </p>
        ) : (
          <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['tenant', 'plan', 'billing', 'requestedAt', 'status', 'actions'].map((col) => (
                    <th
                      key={col}
                      className="text-left px-4 py-3 font-medium text-muted-foreground"
                    >
                      {t(`onboarding.admin.subscriptions.columns.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{sub.tenantId.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-mono text-xs">{sub.planId.slice(0, 8)}…</td>
                    <td className="px-4 py-3 capitalize">{sub.billingCycle}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
                        new Date(sub.requestedAt),
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SubscriptionStatusBadge status={sub.status} t={t} />
                    </td>
                    <td className="px-4 py-3">
                      {sub.status === 'pending_approval' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950"
                            onClick={() => openAction(sub, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('onboarding.admin.subscriptions.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                            onClick={() => openAction(sub, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {t('onboarding.admin.subscriptions.reject')}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve / Reject Sheet */}
      <Sheet open={!!selectedSub} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent>
          {actionType === 'approve' && selectedSub && (
            <>
              <SheetHeader>
                <SheetTitle>{t('onboarding.admin.subscriptions.approveTitle')}</SheetTitle>
                <SheetDescription>
                  {t('onboarding.admin.subscriptions.approveSubtitle')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <Label>{t('onboarding.admin.subscriptions.approveStatus')}</Label>
                  <Select
                    value={approveStatus}
                    onValueChange={(v) => setApproveStatus(v as 'trial' | 'active')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">
                        {t('onboarding.admin.subscriptions.approveStatusTrial')}
                      </SelectItem>
                      <SelectItem value="active">
                        {t('onboarding.admin.subscriptions.approveStatusActive')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {t('onboarding.admin.subscriptions.confirmApprove')}
                </Button>
              </div>
            </>
          )}

          {actionType === 'reject' && selectedSub && (
            <>
              <SheetHeader>
                <SheetTitle>{t('onboarding.admin.subscriptions.rejectTitle')}</SheetTitle>
                <SheetDescription>
                  {t('onboarding.admin.subscriptions.rejectSubtitle')}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="rejectionReason">
                    {t('onboarding.admin.subscriptions.rejectionReason')} *
                  </Label>
                  <textarea
                    id="rejectionReason"
                    className="w-full min-h-[120px] rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={t('onboarding.admin.subscriptions.rejectionReasonPlaceholder')}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {rejectionReason.trim().length} / 20 min
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || rejectionReason.trim().length < 20}
                >
                  {rejectMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {t('onboarding.admin.subscriptions.confirmReject')}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminGuard>
  )
}

function SubscriptionStatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const styles: Record<string, string> = {
    pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    trial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {t(`onboarding.admin.subscriptions.status.${status}`)}
    </span>
  )
}
