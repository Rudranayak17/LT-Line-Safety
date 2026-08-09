import { ArrowRight } from 'lucide-react'

const nodes = [
  'LT Line',
  'Sensors',
  'Edge IoT',
  'API',
  'Detection',
  'Dashboard',
  'Isolation',
]

export default function ArchitectureBanner() {
  return (
    <div className="panel overflow-x-auto p-4">
      <p className="panel-header mb-3">End-to-end software architecture (simulated)</p>
      <div className="flex min-w-max items-center gap-1 sm:gap-2">
        {nodes.map((n, i) => (
          <div key={n} className="flex items-center gap-1 sm:gap-2">
            <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1.5 text-center sm:px-3">
              <span className="text-[11px] font-semibold text-cyan-300 sm:text-xs">{n}</span>
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Works <strong className="font-medium text-slate-400">alongside</strong> existing
        circuit breakers — intelligent detection &amp; remote isolation layer, not a
        replacement for certified protection equipment.
      </p>
    </div>
  )
}
