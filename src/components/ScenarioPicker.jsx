import { Play, Shuffle, Info } from 'lucide-react'
import { RESOLUTION } from '../data/scenarios'

const severityChip = {
  CRITICAL: 'chip-critical',
  WARNING: 'chip-warning',
  INFO: 'chip-normal',
}

const resolutionHint = {
  [RESOLUTION.AUTO_ISOLATE]: '→ Isolate + dispatch',
  [RESOLUTION.ESCALATE]: '→ Escalate then isolate',
  [RESOLUTION.AUTO_CLEAR]: '→ Clear / no line trip',
  [RESOLUTION.MONITOR_ONLY]: '→ Monitor only',
  [RESOLUTION.BREAKER_TRIP]: '→ Local breaker trips',
}

export default function ScenarioPicker({
  scenarios,
  scenarioId,
  selectedScenario,
  isDemoRunning,
  onSelect,
  onRun,
  onRandom,
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="panel-header">Dynamic conditions</p>
            <h3 className="text-base font-semibold text-white">Fault scenario</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost text-xs"
              disabled={isDemoRunning}
              onClick={onRandom}
            >
              <Shuffle className="h-3.5 w-3.5" />
              Random
            </button>
            <button
              type="button"
              className="btn btn-primary text-xs"
              disabled={isDemoRunning}
              onClick={onRun}
            >
              <Play className="h-3.5 w-3.5" />
              {isDemoRunning ? 'Running…' : 'Run scenario'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
        {scenarios.map((s) => {
          const active = s.id === scenarioId
          return (
            <button
              key={s.id}
              type="button"
              disabled={isDemoRunning}
              onClick={() => onSelect(s.id)}
              className={`rounded-xl border p-3 text-left transition-all ${
                active
                  ? 'border-cyan-500/50 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
              } disabled:opacity-50`}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <span className="text-base">{s.icon}</span>
                <span className={`chip ${severityChip[s.severity] || 'chip-offline'}`}>
                  {s.severity}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-100">{s.shortName}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                {s.description}
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-cyan-500/80">
                {s.defaultFeederId} · {resolutionHint[s.resolution]}
              </p>
            </button>
          )
        })}
      </div>

      {selectedScenario && (
        <div className="border-t border-slate-800 bg-slate-950/50 px-4 py-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">{selectedScenario.name}</span>
            <span className="text-slate-600">·</span>
            <span>How it works &amp; resolves</span>
          </div>
          <ol className="mb-2 grid gap-1 sm:grid-cols-2">
            {selectedScenario.howItWorks.map((step, i) => (
              <li key={step} className="flex gap-2 text-xs text-slate-400">
                <span className="font-mono text-cyan-600">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-2">
            <span className="chip chip-normal">Resolve: {selectedScenario.resolutionLabel}</span>
            <span className="chip chip-offline">
              Feeder {selectedScenario.defaultFeederId}
            </span>
            {selectedScenario.needsIsolation ? (
              <span className="chip chip-critical">May isolate</span>
            ) : (
              <span className="chip chip-warning">No line isolation</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
