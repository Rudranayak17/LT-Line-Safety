export default function EventLog({ events }) {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="panel-header">System log</p>
        <h3 className="text-base font-semibold text-white">Event stream</h3>
      </div>
      <ul className="max-h-56 divide-y divide-slate-800/60 overflow-y-auto font-mono text-xs">
        {events.length === 0 && (
          <li className="px-4 py-6 text-center text-slate-600">Waiting for events…</li>
        )}
        {events.map((e) => (
          <li key={e.id} className="flex gap-3 px-4 py-2.5">
            <span className="shrink-0 text-slate-600">
              {e.at.toLocaleTimeString('en-IN', { hour12: false })}
            </span>
            <span className={typeColor(e.type)}>●</span>
            <span className="text-slate-300">{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function typeColor(type) {
  switch (type) {
    case 'critical':
      return 'text-rose-400'
    case 'warning':
      return 'text-amber-400'
    case 'success':
      return 'text-emerald-400'
    default:
      return 'text-cyan-400'
  }
}
