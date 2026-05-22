import { useTranslation } from 'react-i18next'
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Building2, Users, UserCheck, Home, TrendingUp } from 'lucide-react'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/shared/components/ui/card'
import {
  seedTenants,
  seedCondominiums,
  seedResidents,
  seedEmployees,
} from '@/shared/data/seed'

// ── Chart palette ─────────────────────────────────────────────────────
const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

// ── Derived chart data ────────────────────────────────────────────────

/** 6-month simulated tenant growth */
const tenantGrowthData = [
  { month: 'Jan', count: 1 },
  { month: 'Feb', count: 1 },
  { month: 'Mar', count: 2 },
  { month: 'Apr', count: 2 },
  { month: 'May', count: 3 },
  { month: 'Jun', count: 3 },
]

function countBy<T>(arr: T[], key: keyof T) {
  const map: Record<string, number> = {}
  for (const item of arr) {
    const k = String(item[key])
    map[k] = (map[k] ?? 0) + 1
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

const planData      = countBy(seedTenants, 'plan')
const financialData = countBy(seedResidents, 'financialStatus')
const condoTypeData = countBy(seedCondominiums, 'type')
const rolesData     = countBy(seedEmployees, 'role').map(({ name, value }) => ({
  role: name,
  count: value,
}))

// ── Shared tooltip ────────────────────────────────────────────────────
interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background shadow-md px-3 py-2 text-sm">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Pill legend ───────────────────────────────────────────────────────
function PieLegend({
  items,
}: {
  items: { name: string; value: number; color: string; label: string }[]
}) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 justify-center text-xs">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ background: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { t } = useTranslation()

  const stats = [
    {
      icon: Building2,
      label: t('tenants.title'),
      value: seedTenants.length,
      delta: '+1',
      color: 'text-primary',
    },
    {
      icon: Home,
      label: t('condominiums.title'),
      value: seedCondominiums.length,
      delta: '+0',
      color: 'text-blue-600',
    },
    {
      icon: Users,
      label: t('residents.title'),
      value: seedResidents.length,
      delta: '+2',
      color: 'text-emerald-600',
    },
    {
      icon: UserCheck,
      label: t('employees.title'),
      value: seedEmployees.length,
      delta: '+1',
      color: 'text-violet-600',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>

      {/* ── KPI cards ───────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, delta, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-500 font-medium">{delta}</span>
                {t('dashboard.thisMonth')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tenant growth + Plan mix ─────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Area chart — tenant growth */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.tenantGrowth')}</CardTitle>
            <CardDescription>{t('dashboard.tenantGrowthDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={tenantGrowthData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradTenants" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name={t('tenants.title')}
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#gradTenants)"
                  dot={{ r: 4, fill: 'var(--chart-1)', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut — plan distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.planMix')}</CardTitle>
            <CardDescription>{t('dashboard.planMixDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {planData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend
              items={planData.map((entry, i) => ({
                ...entry,
                color: PALETTE[i % PALETTE.length],
                label: t(`tenants.plan.${entry.name}`),
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* ── Financial status | Condo types | Employee roles ──────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Donut — residents financial status */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.financialStatus')}</CardTitle>
            <CardDescription>{t('dashboard.financialStatusDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {financialData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend
              items={financialData.map((entry, i) => ({
                ...entry,
                color: PALETTE[i % PALETTE.length],
                label: t(`residents.financialStatus.${entry.name}`),
              }))}
            />
          </CardContent>
        </Card>

        {/* Donut — condominium types */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.condoTypes')}</CardTitle>
            <CardDescription>{t('dashboard.condoTypesDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={condoTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {condoTypeData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[(i + 2) % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <PieLegend
              items={condoTypeData.map((entry, i) => ({
                ...entry,
                color: PALETTE[(i + 2) % PALETTE.length],
                label: t(`condominiums.type.${entry.name}`),
              }))}
            />
          </CardContent>
        </Card>

        {/* Horizontal bar — employee roles */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.employeeRoles')}</CardTitle>
            <CardDescription>{t('dashboard.employeeRolesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={rolesData}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="role"
                  width={96}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => t(`employees.role.${v}`)}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'var(--accent)', opacity: 0.6 }}
                />
                <Bar
                  dataKey="count"
                  name={t('employees.title')}
                  radius={[0, 4, 4, 0]}
                >
                  {rolesData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
