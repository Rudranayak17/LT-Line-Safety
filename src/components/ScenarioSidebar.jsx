import { Play, Shuffle } from 'lucide-react'
import { RESOLUTION } from '../data/scenarios'

const severityDot = {
  CRITICAL: 'bg-rose-400',
  WARNING: 'bg-amber-400',
  INFO: 'bg-emerald-400',
}

const resolveShort = {
  [RESOLUTION.AUTO_ISOLATE]: 'Isolate',
  [RESOLUTION.ESCALATE]: 'Escalate',
  [RESOLUTION.AUTO_CLEAR]: 'Clear',
  [RESOLUTION.MONITOR_ONLY]: 'Monitor',
  [RESOLUTION.BREAKER_TRIP]: 'Breaker',
}

/**
 * Compact left sidebar for dynamic conditions — fits one screen.
 */
export default function ScenarioSidebar({
  scenarios,
  scenarioId,
  selectedScenario,
  isDemoRunning,
  onSelect,
  onRun,
  onRandom,
  counts,
}) {
  return (
    <aside className="flex h-full min-h-0 w-[220px] shrink-0 flex-col border-r border-slate-800/90 bg-slate-950/70">
      <div className="shrink-0 border-b border-slate-800 px-3 py-2.5">
        <p className="panel-header">Conditions</p>
        <h2 className="text-sm font-semibold text-white">Fault scenarios</h2>
        <div className="mt-1.5 flex gap-1.5 font-mono text-[10px] text-slate-500">
          <span className="text-emerald-400">N{counts.normal}</span>
          <span className="text-amber-400">W{counts.warning}</span>
          <span className="text-rose-400">C{counts.critical}</span>
          <span className="text-violet-400">I{counts.isolated}</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">
        {scenarios.map((s) => {
          const active = s.id === scenarioId
          return (
            <button
              key={s.id}
              type="button"
              disabled={isDemoRunning}
              onClick={() => onSelect(s.id)}
              className={`flex w-full items-start gap-2 rounded-lg border px-2 py-2 text-left transition-all ${
                active
                  ? 'border-cyan-500/45 bg-cyan-500/12'
                  : 'border-transparent bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
              } disabled:opacity-50`}
            >
              <span className="text-sm leading-none">{s.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${severityDot[s.severity] || 'bg-slate-500'}`}
                  />
                  <span className="truncate text-xs font-semibold text-slate-100">
                    {s.shortName}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">
                  {s.defaultFeederId} · {resolveShort[s.resolution]}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedScenario && (
        <div className="shrink-0 border-t border-slate-800 px-2.5 py-2">
          <p className="line-clamp-2 text-[10px] leading-snug text-slate-500">
            {selectedScenario.description}
          </p>
          <p className="mt-1 font-mono text-[10px] text-cyan-500/90">
            → {selectedScenario.resolutionLabel}
          </p>
        </div>
      )}

      <div className="shrink-0 space-y-1.5 border-t border-slate-800 p-2">
        <button
          type="button"
          className="btn btn-primary w-full !py-2 text-xs"
          disabled={isDemoRunning}
          onClick={onRun}
        >
          <Play className="h-3.5 w-3.5" />
          {isDemoRunning ? 'Running…' : 'Run simulation'}
        </button>
        <button
          type="button"
          className="btn btn-ghost w-full !py-1.5 text-xs"
          disabled={isDemoRunning}
          onClick={onRandom}
        >
          <Shuffle className="h-3.5 w-3.5" />
          Random condition
        </button>
      </div>
    </aside>
  )
}
