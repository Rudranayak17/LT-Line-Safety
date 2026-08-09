import { Check, Loader2, Circle, CheckCheck, Siren, MapPin } from 'lucide-react'
import { PHASE } from '../hooks/useSimulation'
import { DETECTION_STEPS } from '../data/feeders'
import { RESOLUTION } from '../data/scenarios'

/**
 * Compact right column: alerts, detection, timeline, actions — Ops screen.
 */
export default function RightDock({
  alerts,
  phase,
  scenario,
  resolutionNote,
  verifyProgress,
  detectionLog,
  incidentStages,
  incidentStage,
  events,
  onAcknowledge,
  onDispatch,
  onIsolate,
  onRepair,
}) {
  const logMap = Object.fromEntries(detectionLog.map((d) => [d.step, d]))
  const canIsolate =
    scenario?.needsIsolation &&
    (phase === PHASE.CONFIRMED || phase === PHASE.VERIFYING || phase === PHASE.ANOMALY)
  const canDispatch =
    scenario?.needsDispatch &&
    (phase === PHASE.ISOLATED ||
      phase === PHASE.DISPATCHED ||
      phase === PHASE.CONFIRMED ||
      phase === PHASE.CLEARED)
  const canRepair =
    phase === PHASE.DISPATCHED ||
    phase === PHASE.ISOLATED ||
    phase === PHASE.CONFIRMED ||
    phase === PHASE.CLEARED

  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col gap-2 overflow-hidden bg-slate-950/40 p-2 lg:w-[300px] lg:border-l lg:border-slate-800/90">
      {/* Alert + actions */}
      <div className="panel flex min-h-0 shrink-0 flex-col overflow-hidden !rounded-xl p-2.5">
        <p className="panel-header mb-1.5 !text-[9px]">Control room</p>

        {resolutionNote && (
          <p className="mb-1.5 line-clamp-2 rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-200">
            {resolutionNote}
          </p>
        )}

        <div className="max-h-[110px] min-h-0 space-y-1.5 overflow-y-auto">
          {alerts.length === 0 && (
            <p className="rounded-md border border-dashed border-slate-700 px-2 py-3 text-center text-[11px] text-slate-500">
              No alerts — pick a condition &amp; run
            </p>
          )}
          {alerts.slice(0, 2).map((a) => {
            const critical = a.severity === 'CRITICAL'
            return (
              <div
                key={a.id}
                className={`rounded-lg border p-2 ${
                  a.acknowledged
                    ? 'border-slate-700 bg-slate-900/50'
                    : critical
                      ? 'border-rose-500/40 bg-rose-500/10 glow-critical'
                      : 'border-amber-500/30 bg-amber-500/10'
                }`}
              >
                <div className="flex items-start gap-1.5">
                  <Siren
                    className={`mt-0.5 h-3 w-3 shrink-0 ${critical ? 'text-rose-400' : 'text-amber-400'}`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-[11px] font-bold ${critical ? 'text-rose-300' : 'text-amber-200'}`}
                    >
                      {a.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-400">{a.message}</p>
                    <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-slate-500">
                      <MapPin className="h-2.5 w-2.5 text-cyan-500" />
                      {a.feeder} · {a.pole}
                    </p>
                  </div>
                </div>
                {!a.acknowledged && (
                  <button
                    type="button"
                    className="btn btn-ghost mt-1.5 w-full !py-1 text-[10px]"
                    onClick={() => onAcknowledge(a.id)}
                  >
                    <CheckCheck className="h-3 w-3" /> Ack
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-1.5 space-y-1 border-t border-slate-800 pt-1.5">
          {canIsolate && (
            <button type="button" className="btn btn-danger w-full !py-1.5 text-[11px]" onClick={onIsolate}>
              Isolate feeder
            </button>
          )}
          {canDispatch && (
            <button type="button" className="btn btn-primary w-full !py-1.5 text-[11px]" onClick={onDispatch}>
              Dispatch team
            </button>
          )}
          {canRepair && (
            <button type="button" className="btn btn-success w-full !py-1.5 text-[11px]" onClick={onRepair}>
              Mark resolved
            </button>
          )}
          {scenario &&
            !scenario.needsIsolation &&
            scenario.resolution !== RESOLUTION.BREAKER_TRIP &&
            (phase === PHASE.CONFIRMED || phase === PHASE.CLEARED) && (
              <p className="text-center text-[10px] text-slate-500">No isolation for this class</p>
            )}
          {phase === PHASE.ISOLATING && (
            <p className="text-center text-[10px] text-amber-400">Isolating…</p>
          )}
          {(phase === PHASE.RESTORED || phase === PHASE.CLEARED) && (
            <p className="text-center text-[10px] text-emerald-400">
              {phase === PHASE.CLEARED ? 'Cleared — no isolation' : 'Restored'}
            </p>
          )}
        </div>
      </div>

      {/* Detection steps */}
      <div className="panel min-h-0 flex-1 overflow-hidden !rounded-xl p-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="panel-header !text-[9px]">Detection</p>
          <span className="font-mono text-[9px] text-slate-600">
            {scenario?.classifyLabel || '—'}
          </span>
        </div>
        <div className="space-y-1 overflow-y-auto">
          {DETECTION_STEPS.map((step) => {
            const log = logMap[step.id]
            const status = log?.status ?? 'idle'
            return (
              <div
                key={step.id}
                className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] ${
                  status === 'active'
                    ? 'bg-cyan-500/10 text-cyan-200'
                    : status === 'ok'
                      ? 'text-emerald-300/90'
                      : 'text-slate-600'
                }`}
              >
                {status === 'ok' && <Check className="h-3 w-3 shrink-0" />}
                {status === 'active' && <Loader2 className="h-3 w-3 shrink-0 animate-spin" />}
                {status === 'idle' && <Circle className="h-3 w-3 shrink-0" />}
                <span className="truncate font-medium">{step.label}</span>
                {log?.note && (
                  <span className="ml-auto max-w-[45%] truncate text-[9px] opacity-70">
                    {log.note}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {phase === PHASE.VERIFYING && (
          <div className="mt-1.5">
            <div className="mb-0.5 flex justify-between text-[9px] text-slate-500">
              <span>Verify</span>
              <span className="font-mono text-cyan-400">{Math.round(verifyProgress)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                style={{ width: `${verifyProgress}%` }}
              />
            </div>
          </div>
        )}

        {scenario?.rules && (
          <div className="mt-1.5 border-t border-slate-800 pt-1.5 font-mono text-[9px] leading-relaxed text-slate-500">
            {scenario.rules.slice(0, 3).map((r) => (
              <div key={r}>• {r}</div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline chips */}
      <div className="panel shrink-0 !rounded-xl p-2">
        <p className="panel-header mb-1.5 !text-[9px]">Incident path</p>
        <div className="flex flex-wrap gap-1">
          {incidentStages.map((stage, i) => {
            const done = incidentStage !== null && i < incidentStage
            const active = incidentStage === i
            return (
              <span
                key={stage}
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                  done
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : active
                      ? 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/40'
                      : 'bg-slate-800/80 text-slate-600'
                }`}
              >
                {i + 1}. {stage.split(' ')[0]}
              </span>
            )
          })}
        </div>
      </div>

      {/* Mini event log */}
      <div className="panel min-h-0 max-h-[88px] shrink overflow-hidden !rounded-xl">
        <div className="border-b border-slate-800 px-2 py-1">
          <p className="panel-header !text-[9px]">Events</p>
        </div>
        <ul className="max-h-[60px] overflow-y-auto font-mono text-[9px]">
          {events.length === 0 && <li className="px-2 py-2 text-slate-600">Waiting…</li>}
          {events.slice(0, 6).map((e) => (
            <li key={e.id} className="flex gap-1.5 border-b border-slate-800/50 px-2 py-1">
              <span className="shrink-0 text-slate-600">
                {e.at.toLocaleTimeString('en-IN', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
              <span
                className={
                  e.type === 'critical'
                    ? 'text-rose-400'
                    : e.type === 'warning'
                      ? 'text-amber-400'
                      : e.type === 'success'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                }
              >
                {e.message}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
