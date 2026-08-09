import { Check } from 'lucide-react'

export default function IncidentTimeline({ stages, currentStage }) {
  return (
    <div className="panel p-4 sm:p-5">
      <p className="panel-header mb-1">Incident management</p>
      <h3 className="mb-4 text-base font-semibold text-white">Lifecycle</h3>

      {currentStage === null ? (
        <p className="text-sm text-slate-500">No active incident. Run the line-break simulation.</p>
      ) : (
        <ol className="relative space-y-0">
          {stages.map((stage, i) => {
            const done = i < currentStage
            const active = i === currentStage
            const pending = i > currentStage
            return (
              <li key={stage} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                      done
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : active
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 pulse-dot'
                          : 'border-slate-700 bg-slate-900 text-slate-600'
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className={`mt-1 w-0.5 flex-1 min-h-[16px] ${
                        done ? 'bg-emerald-500/50' : 'bg-slate-800'
                      }`}
                    />
                  )}
                </div>
                <div className="pt-1">
                  <p
                    className={`text-sm font-medium ${
                      pending ? 'text-slate-600' : active ? 'text-cyan-300' : 'text-slate-200'
                    }`}
                  >
                    {stage}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
