/** Fills parent height — use inside a sized flex/grid cell */
export default function FeederList({ feeders, selectedId, onSelect }) {
  return (
    <div className="panel flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-800 px-2.5 py-2">
        <p className="panel-header !text-[9px]">LT feeders</p>
        <h3 className="text-xs font-semibold text-white">Network status</h3>
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-slate-800/80 overflow-y-auto overscroll-contain">
        {feeders.map((f) => {
          const active = f.id === selectedId
          const chip = statusChip(f.status)
          return (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => onSelect(f.id)}
                className={`flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors ${
                  active ? 'bg-cyan-500/10' : 'hover:bg-slate-800/40'
                }`}
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${dotColor(f.status)} ${
                    ['LINE_BREAK', 'WARNING', 'SENSOR_FAULT', 'OUTAGE'].includes(f.status)
                      ? 'pulse-dot'
                      : ''
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="truncate text-xs font-semibold text-slate-100">
                      {f.name}{' '}
                      <span className="font-mono text-[10px] font-normal text-slate-500">
                        {f.id}
                      </span>
                    </p>
                    <span className={`chip shrink-0 !px-1.5 !py-0 !text-[9px] ${chip}`}>
                      {label(f.status)}
                    </span>
                  </div>
                  <p className="truncate text-[10px] text-slate-500">
                    {f.zone} · {f.pole}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                    {f.voltage}V · {f.current}A · {f.frequency}Hz
                  </p>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function statusChip(status) {
  switch (status) {
    case 'NORMAL':
      return 'chip-normal'
    case 'WARNING':
    case 'SENSOR_FAULT':
    case 'OUTAGE':
      return 'chip-warning'
    case 'LINE_BREAK':
      return 'chip-critical'
    case 'ISOLATED':
      return 'chip-isolated'
    default:
      return 'chip-offline'
  }
}

function label(status) {
  if (status === 'LINE_BREAK') return 'BREAK'
  if (status === 'SENSOR_FAULT') return 'SENSOR'
  return status
}

function dotColor(status) {
  switch (status) {
    case 'NORMAL':
      return 'bg-emerald-400'
    case 'WARNING':
      return 'bg-amber-400'
    case 'SENSOR_FAULT':
      return 'bg-violet-400'
    case 'OUTAGE':
      return 'bg-slate-400'
    case 'LINE_BREAK':
      return 'bg-rose-400'
    case 'ISOLATED':
      return 'bg-violet-400'
    default:
      return 'bg-slate-500'
  }
}
