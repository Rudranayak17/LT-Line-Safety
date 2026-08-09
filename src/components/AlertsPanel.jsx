import { Bell, MapPin, CheckCheck, Siren } from 'lucide-react'
import { PHASE } from '../hooks/useSimulation'
import { RESOLUTION } from '../data/scenarios'

export default function AlertsPanel({
  alerts,
  phase,
  scenario,
  resolutionNote,
  onAcknowledge,
  onDispatch,
  onIsolate,
  onRepair,
}) {
  const canIsolate =
    scenario?.needsIsolation &&
    (phase === PHASE.CONFIRMED || phase === PHASE.VERIFYING || phase === PHASE.ANOMALY)

  const canDispatch =
    phase === PHASE.ISOLATED ||
    phase === PHASE.DISPATCHED ||
    phase === PHASE.CONFIRMED ||
    (scenario?.needsDispatch &&
      (phase === PHASE.CONFIRMED || phase === PHASE.CLEARED || phase === PHASE.ISOLATED))

  const canRepair =
    phase === PHASE.DISPATCHED ||
    phase === PHASE.ISOLATED ||
    phase === PHASE.CONFIRMED ||
    phase === PHASE.CLEARED

  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="panel-header">Control room</p>
            <h3 className="text-base font-semibold text-white">Alerts &amp; resolution</h3>
          </div>
          <Bell className="h-4 w-4 text-slate-500" />
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {resolutionNote && (
          <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            <span className="font-semibold">Resolution path: </span>
            {resolutionNote}
          </div>
        )}

        {alerts.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-8 text-center">
            <p className="text-sm text-slate-400">No active alerts</p>
            <p className="mt-1 text-xs text-slate-600">
              Pick a <span className="text-cyan-500">condition</span> and run the simulation
            </p>
          </div>
        )}

        {alerts.map((a) => {
          const critical = a.severity === 'CRITICAL'
          return (
            <div
              key={a.id}
              className={`rounded-xl border p-4 ${
                a.acknowledged
                  ? 'border-slate-700 bg-slate-900/50'
                  : critical
                    ? 'border-rose-500/40 bg-rose-500/10 glow-critical'
                    : 'border-amber-500/35 bg-amber-500/10'
              }`}
            >
              <div className="mb-2 flex items-start gap-2">
                <Siren
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    critical ? 'text-rose-400' : 'text-amber-400'
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-bold tracking-wide ${
                      critical ? 'text-rose-300' : 'text-amber-200'
                    }`}
                  >
                    {a.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">{a.message}</p>
                </div>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-slate-950/50 px-2 py-1.5">
                  <span className="text-slate-500">Feeder</span>
                  <p className="font-mono font-semibold text-slate-200">{a.feeder}</p>
                </div>
                <div className="rounded-lg bg-slate-950/50 px-2 py-1.5">
                  <span className="text-slate-500">Severity</span>
                  <p
                    className={`font-semibold ${
                      critical ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {a.severity}
                  </p>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 rounded-lg bg-slate-950/50 px-2 py-1.5 text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  {a.zone} · Pole {a.pole}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!a.acknowledged && (
                  <button
                    type="button"
                    className="btn btn-ghost text-xs"
                    onClick={() => onAcknowledge(a.id)}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Acknowledge
                  </button>
                )}
                {a.acknowledged && <span className="chip chip-normal">Acknowledged</span>}
              </div>
            </div>
          )
        })}

        <div className="space-y-2 border-t border-slate-800 pt-3">
          <p className="panel-header mb-2">Operator actions</p>

          {canIsolate && (
            <button type="button" className="btn btn-danger w-full" onClick={onIsolate}>
              Isolate feeder (simulate)
            </button>
          )}

          {scenario &&
            !scenario.needsIsolation &&
            scenario.resolution !== RESOLUTION.BREAKER_TRIP &&
            (phase === PHASE.CONFIRMED || phase === PHASE.CLEARED) && (
              <p className="rounded-lg bg-slate-900/80 px-3 py-2 text-center text-xs text-slate-400">
                Isolation not required for this classification
                {scenario.resolution === RESOLUTION.AUTO_CLEAR && ' (auto-clear / sensor path)'}
                {scenario.resolution === RESOLUTION.MONITOR_ONLY && ' (upstream outage)'}
              </p>
            )}

          {canDispatch && scenario?.needsDispatch && (
            <button type="button" className="btn btn-primary w-full" onClick={onDispatch}>
              Dispatch field / maintenance team
            </button>
          )}

          {canRepair && (
            <button type="button" className="btn btn-success w-full" onClick={onRepair}>
              Mark issue resolved / restore
            </button>
          )}

          {phase === PHASE.ISOLATING && (
            <p className="text-center text-xs text-amber-400">Sending isolation command…</p>
          )}
          {phase === PHASE.RESTORED && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-400">
              System restored — feeder back to NORMAL
            </p>
          )}
          {phase === PHASE.CLEARED && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-400">
              Transient cleared — no isolation was needed
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
