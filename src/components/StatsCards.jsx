import { CheckCircle2, AlertTriangle, Siren, PowerOff } from 'lucide-react'

const cards = [
  {
    key: 'normal',
    label: 'Normal',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
    bg: 'from-emerald-500/10 to-transparent',
  },
  {
    key: 'warning',
    label: 'Warnings',
    icon: AlertTriangle,
    color: 'text-amber-400',
    ring: 'ring-amber-500/20',
    bg: 'from-amber-500/10 to-transparent',
  },
  {
    key: 'critical',
    label: 'Critical',
    icon: Siren,
    color: 'text-rose-400',
    ring: 'ring-rose-500/20',
    bg: 'from-rose-500/10 to-transparent',
  },
  {
    key: 'isolated',
    label: 'Isolated',
    icon: PowerOff,
    color: 'text-violet-400',
    ring: 'ring-violet-500/20',
    bg: 'from-violet-500/10 to-transparent',
  },
]

export default function StatsCards({ counts }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        const value = counts[c.key] ?? 0
        return (
          <div
            key={c.key}
            className={`panel relative overflow-hidden bg-gradient-to-br ${c.bg} p-4 ring-1 ${c.ring} fade-up`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="panel-header mb-1">{c.label}</p>
                <p className={`metric-value text-3xl font-semibold ${c.color}`}>{value}</p>
              </div>
              <Icon className={`h-5 w-5 ${c.color} opacity-80`} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Active feeders</p>
          </div>
        )
      })}
    </div>
  )
}
