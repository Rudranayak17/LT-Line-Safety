/**
 * Simplified schematic "GIS" map of feeders (software demo — no Mapbox key required).
 */
export default function FeederMap({ feeders, selectedId, onSelect }) {
  // Project lat/lng into SVG space
  const lats = feeders.map((f) => f.lat)
  const lngs = feeders.map((f) => f.lng)
  const minLat = Math.min(...lats) - 0.008
  const maxLat = Math.max(...lats) + 0.008
  const minLng = Math.min(...lngs) - 0.008
  const maxLng = Math.max(...lngs) + 0.008

  const project = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * 100
    return { x, y }
  }

  // Simple feeder lines from a virtual substation center
  const center = project(28.613, 77.212)

  return (
    <div className="panel flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-800 px-3 py-2">
        <p className="panel-header">Feeder map</p>
        <h3 className="text-sm font-semibold text-white">Zone overview</h3>
      </div>
      <div className="relative min-h-0 flex-1 bg-[#0a1220]">
        {/* grid */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i}>
              <line x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#1e293b" strokeWidth="0.15" />
              <line x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#1e293b" strokeWidth="0.15" />
            </g>
          ))}
          {/* roads */}
          <path d="M5 40 Q40 38 55 55 T95 50" fill="none" stroke="#1e3a5f" strokeWidth="1.2" />
          <path d="M20 5 Q30 40 25 95" fill="none" stroke="#1e3a5f" strokeWidth="1" />
          <path d="M60 10 Q65 50 80 90" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />

          {/* lines from substation */}
          {feeders.map((f) => {
            const p = project(f.lat, f.lng)
            const color =
              f.status === 'LINE_BREAK'
                ? '#f87171'
                : f.status === 'WARNING' || f.status === 'OUTAGE'
                  ? '#fbbf24'
                  : f.status === 'SENSOR_FAULT'
                    ? '#c4b5fd'
                    : f.status === 'ISOLATED'
                      ? '#a78bfa'
                      : '#22d3ee'
            return (
              <line
                key={`line-${f.id}`}
                x1={center.x}
                y1={center.y}
                x2={p.x}
                y2={p.y}
                stroke={color}
                strokeWidth={f.id === selectedId ? 0.7 : 0.35}
                opacity={0.55}
                strokeDasharray={f.status === 'ISOLATED' ? '1.5 1' : undefined}
              />
            )
          })}

          {/* substation */}
          <rect
            x={center.x - 2.5}
            y={center.y - 2.5}
            width="5"
            height="5"
            rx="0.8"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="0.3"
          />
        </svg>

        {/* feeder markers as HTML for interactivity */}
        {feeders.map((f) => {
          const p = project(f.lat, f.lng)
          const active = f.id === selectedId
          const color =
            f.status === 'LINE_BREAK'
              ? 'bg-rose-500'
              : f.status === 'WARNING' || f.status === 'OUTAGE'
                ? 'bg-amber-400'
                : f.status === 'SENSOR_FAULT'
                  ? 'bg-violet-300'
                  : f.status === 'ISOLATED'
                    ? 'bg-violet-400'
                    : 'bg-emerald-400'
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelect(f.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform ${
                active ? 'scale-125 z-10' : 'hover:scale-110'
              }`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={`${f.name} — ${f.status}`}
            >
              <span
                className={`block h-3.5 w-3.5 rounded-full ring-2 ring-slate-950 ${color} ${
                  f.status === 'LINE_BREAK' || f.status === 'WARNING' ? 'pulse-dot' : ''
                }`}
              />
              <span
                className={`absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded bg-slate-950/90 px-1.5 py-0.5 font-mono text-[9px] ${
                  active ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                {f.id}
              </span>
            </button>
          )
        })}

        {/* legend */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 rounded-lg bg-slate-950/80 px-2 py-1.5 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-emerald-400" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-amber-400" /> Warn
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-rose-500" /> Break
          </span>
          <span className="flex items-center gap-1">
            <i className="h-2 w-2 rounded-full bg-violet-400" /> Isolated
          </span>
        </div>
      </div>
    </div>
  )
}
