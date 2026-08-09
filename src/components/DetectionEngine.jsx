import { DETECTION_STEPS } from '../data/feeders'
import { PHASE } from '../hooks/useSimulation'
import { Check, Loader2, Circle } from 'lucide-react'

export default function DetectionEngine({
  phase,
  verifyProgress,
  detectionLog,
  scenario,
  resolutionNote,
}) {
  const logMap = Object.fromEntries(detectionLog.map((d) => [d.step, d]))
  const rules = scenario?.rules || []

  return (
    <div className="panel p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="panel-header">Detection engine</p>
          <h3 className="text-base font-semibold text-white">
            {scenario ? scenario.shortName : 'Rule-based analysis'}
          </h3>
        </div>
        <span className="font-mono text-[10px] text-slate-500">DYNAMIC RULES</span>
      </div>

      <div className="space-y-2.5">
        {DETECTION_STEPS.map((step) => {
          const log = logMap[step.id]
          const status = log?.status ?? 'idle'
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                status === 'active'
                  ? 'border-cyan-500/40 bg-cyan-500/10'
                  : status === 'ok'
                    ? 'border-emerald-500/25 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="mt-0.5">
                {status === 'ok' && <Check className="h-4 w-4 text-emerald-400" />}
                {status === 'active' && (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                )}
                {status === 'idle' && <Circle className="h-4 w-4 text-slate-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-100">{step.label}</p>
                <p className="text-xs text-slate-500">{log?.note || step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {(phase === PHASE.VERIFYING || (verifyProgress > 0 && verifyProgress < 100)) &&
        phase !== PHASE.NORMAL &&
        phase !== PHASE.CLEARED &&
        phase !== PHASE.RESTORED && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>Verification hold</span>
              <span className="font-mono text-cyan-400">{Math.round(verifyProgress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-200"
                style={{ width: `${verifyProgress}%` }}
              />
            </div>
          </div>
        )}

      {rules.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-cyan-500/90">
            Active rule signature
          </p>
          <ul className="space-y-1">
            {rules.map((r) => (
              <li key={r} className="font-mono text-[11px] text-slate-400">
                • {r}
              </li>
            ))}
          </ul>
          {scenario && (
            <p className="mt-2 border-t border-slate-800 pt-2 font-mono text-[11px] text-slate-300">
              THEN classify ={' '}
              <span className="text-rose-400">&quot;{scenario.classifyLabel}&quot;</span>
              <br />
              RESOLVE ={' '}
              <span className="text-emerald-400">
                {resolutionNote || scenario.resolutionLabel}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
