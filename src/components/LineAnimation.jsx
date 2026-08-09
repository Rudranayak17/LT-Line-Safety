import { PHASE } from '../hooks/useSimulation'

/**
 * Compact field animation for single-screen layout.
 */
export default function LineAnimation({ phase, feeder, scenario, compact }) {
  const visual = scenario?.visual || 'broken_wire'
  const isFaultyPhase = [
    PHASE.ANOMALY,
    PHASE.VERIFYING,
    PHASE.CONFIRMED,
    PHASE.ISOLATING,
  ].includes(phase)

  const isOff =
    phase === PHASE.ISOLATED ||
    phase === PHASE.DISPATCHED ||
    (phase === PHASE.CONFIRMED && (visual === 'short_circuit' || visual === 'outage')) ||
    feeder?.status === 'ISOLATED' ||
    feeder?.status === 'OUTAGE'

  const isRestored = phase === PHASE.RESTORED || phase === PHASE.CLEARED
  const isCleared = phase === PHASE.CLEARED

  const showBrokenWire =
    isFaultyPhase &&
    ['broken_wire', 'fallen_live', 'intermittent', 'phase_open'].includes(visual) &&
    !(visual === 'intermittent' && phase === PHASE.ANOMALY && feeder?.continuity)

  const showPhaseOpen = visual === 'phase_open' && isFaultyPhase && !isOff
  const showSensorGlitch = visual === 'sensor_fault' && isFaultyPhase
  const showShortFlash =
    visual === 'short_circuit' && (phase === PHASE.ANOMALY || phase === PHASE.VERIFYING)
  const showTransientDip = visual === 'transient' && isFaultyPhase
  const liveDanger =
    showBrokenWire &&
    !isOff &&
    (visual === 'broken_wire' || visual === 'fallen_live' || visual === 'intermittent')

  const statusLabel = (() => {
    if (isCleared) return { text: 'TRANSIENT CLEARED', className: 'chip-normal' }
    if (isRestored) return { text: 'RESTORED', className: 'chip-normal' }
    if (phase === PHASE.ISOLATED || phase === PHASE.DISPATCHED)
      return { text: 'ISOLATED — OFF', className: 'chip-isolated' }
    if (feeder?.status === 'OUTAGE' || (visual === 'outage' && isOff))
      return { text: 'OUTAGE', className: 'chip-offline' }
    if (feeder?.status === 'SENSOR_FAULT')
      return { text: 'SENSOR FAULT', className: 'chip-warning' }
    if (phase === PHASE.ISOLATING) return { text: 'ISOLATING…', className: 'chip-critical' }
    if (phase === PHASE.CONFIRMED)
      return {
        text: (scenario?.classifyLabel || 'CONFIRMED').replace(/_/g, ' '),
        className: scenario?.severity === 'CRITICAL' ? 'chip-critical' : 'chip-warning',
      }
    if (phase === PHASE.VERIFYING) return { text: 'VERIFYING…', className: 'chip-warning' }
    if (phase === PHASE.ANOMALY) return { text: 'ABNORMAL', className: 'chip-warning' }
    return { text: 'NORMAL', className: 'chip-normal' }
  })()

  const wireColor = isOff
    ? '#475569'
    : liveDanger
      ? '#f87171'
      : showTransientDip
        ? '#fbbf24'
        : showSensorGlitch
          ? '#a78bfa'
          : showShortFlash
            ? '#fb7185'
            : '#22d3ee'

  return (
    <div className={`panel flex min-h-0 flex-col overflow-hidden ${compact ? 'p-2.5' : 'p-4'}`}>
      <div className="mb-1.5 flex shrink-0 flex-wrap items-center justify-between gap-1.5">
        <div className="min-w-0">
          <p className="panel-header !text-[9px]">Field simulation</p>
          <h2 className="truncate text-sm font-semibold text-white">
            {feeder?.name ?? 'Feeder'} · {feeder?.pole ?? '—'}
            {scenario && (
              <span className="ml-1.5 text-xs font-normal text-slate-400">
                {scenario.icon} {scenario.shortName}
              </span>
            )}
          </h2>
        </div>
        <span className={`chip shrink-0 !text-[9px] ${statusLabel.className}`}>
          {statusLabel.text}
        </span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-700/60 bg-gradient-to-b from-slate-900 via-[#0c1525] to-[#0a1620]">
        {liveDanger && (
          <div className="pointer-events-none absolute inset-0 bg-rose-500/10 danger-flash" />
        )}
        {showShortFlash && (
          <div className="pointer-events-none absolute inset-0 bg-orange-500/15 danger-flash" />
        )}

        <svg
          viewBox="0 0 800 280"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="LT line animation"
        >
          <defs>
            <linearGradient id="poleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <filter id="glowCyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowRed" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="220" width="800" height="60" fill="#0f2918" opacity="0.9" />
          <path
            d="M0 220 Q200 212 400 218 T800 220 L800 280 L0 280 Z"
            fill="#14532d"
            opacity="0.45"
          />

          <rect x="24" y="175" width="60" height="42" rx="3" fill="#1e293b" stroke="#475569" />
          <text x="54" y="200" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="IBM Plex Mono">
            S/S
          </text>
          <circle
            cx="54"
            cy="165"
            r="7"
            fill={isOff && visual !== 'sensor_fault' ? '#475569' : wireColor}
            filter={isOff ? undefined : 'url(#glowCyan)'}
          />

          {[
            { x: 160, label: 'P-A' },
            { x: 400, label: feeder?.pole || 'P-B', critical: true },
            { x: 640, label: 'P-C' },
          ].map((p) => (
            <g key={p.x}>
              <rect x={p.x - 7} y="100" width="14" height="120" rx="2" fill="url(#poleGrad)" />
              <rect x={p.x - 24} y="96" width="48" height="8" rx="2" fill="#475569" />
              <circle cx={p.x - 18} cy="116" r="3.5" fill="#94a3b8" />
              <circle cx={p.x + 18} cy="116" r="3.5" fill="#94a3b8" />
              <text
                x={p.x}
                y="240"
                textAnchor="middle"
                fill={p.critical && isFaultyPhase ? '#f87171' : '#64748b'}
                fontSize="10"
                fontFamily="IBM Plex Mono"
                fontWeight="600"
              >
                {p.label}
              </text>
              {p.critical && (
                <circle
                  cx={p.x}
                  cy="84"
                  r="4.5"
                  fill={isOff ? '#a78bfa' : isFaultyPhase ? '#f87171' : '#34d399'}
                  className={isFaultyPhase && !isOff ? 'pulse-dot' : ''}
                />
              )}
            </g>
          ))}

          {showBrokenWire || (visual === 'fallen_live' && isFaultyPhase) ? (
            <>
              <path
                d="M84 116 C200 100, 280 125, 360 118"
                fill="none"
                stroke={liveDanger ? '#fbbf24' : wireColor}
                strokeWidth="3"
                filter={liveDanger ? 'url(#glowRed)' : undefined}
              />
              {!isOff && (
                <path
                  d="M84 116 C200 100, 280 125, 360 118"
                  fill="none"
                  stroke="#fde68a"
                  strokeWidth="2"
                  className="current-flow"
                  opacity="0.55"
                />
              )}
              <g
                style={{
                  transformOrigin: '360px 118px',
                  transition: 'transform 1.1s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'rotate(72deg) translate(8px, 4px)',
                }}
              >
                <path
                  d="M360 118 Q395 175, 415 218"
                  fill="none"
                  stroke={liveDanger ? '#f87171' : '#64748b'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter={liveDanger ? 'url(#glowRed)' : undefined}
                />
                {liveDanger && (
                  <>
                    <circle cx="415" cy="220" r="5" fill="#fbbf24" className="pulse-dot" />
                    <circle cx="412" cy="212" r="2" fill="#fef08a" className="spark" />
                  </>
                )}
              </g>
              <path
                d="M440 122 C520 105, 600 130, 710 116"
                fill="none"
                stroke="#64748b"
                strokeWidth="3"
                strokeDasharray={liveDanger ? '8 4' : '0'}
              />
              {liveDanger && (
                <text x="400" y="262" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="700">
                  {visual === 'fallen_live' ? '⚠ FALLEN LIVE' : '⚠ BROKEN CONDUCTOR'}
                </text>
              )}
              {isOff && !isRestored && (
                <text x="400" y="262" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700">
                  SUPPLY ISOLATED
                </text>
              )}
            </>
          ) : showPhaseOpen ? (
            <>
              <path d="M84 110 C250 98, 400 110, 710 110" fill="none" stroke="#22d3ee" strokeWidth="2.5" />
              <path d="M84 120 C250 108, 400 120, 710 120" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M84 130 C250 118, 360 130, 380 130" fill="none" stroke="#f87171" strokeWidth="2.5" />
              <path
                d="M430 130 C500 130, 600 118, 710 130"
                fill="none"
                stroke="#64748b"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <circle cx="405" cy="130" r="5" fill="#f87171" className="pulse-dot" />
              <text x="405" y="155" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">
                PHASE OPEN
              </text>
            </>
          ) : showSensorGlitch ? (
            <>
              <path
                d="M84 116 C200 100, 300 132, 400 116 S600 100, 710 116"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
                filter="url(#glowCyan)"
              />
              <path
                d="M84 116 C200 100, 300 132, 400 116 S600 100, 710 116"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="2"
                className="current-flow"
                opacity="0.7"
              />
              <rect x="360" y="58" width="80" height="24" rx="5" fill="#4c1d95" stroke="#a78bfa" />
              <text x="400" y="74" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="700">
                SENSOR ✗
              </text>
              <text x="400" y="262" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700">
                LINE OK — DEVICE FAULT
              </text>
            </>
          ) : showShortFlash ? (
            <>
              <path
                d="M84 116 C200 100, 300 132, 400 116 S600 100, 710 116"
                fill="none"
                stroke="#fb7185"
                strokeWidth="4"
                filter="url(#glowRed)"
              />
              <circle cx="400" cy="116" r="12" fill="#fbbf24" opacity="0.85" className="pulse-dot" />
              <text x="400" y="262" textAnchor="middle" fill="#fb7185" fontSize="11" fontWeight="700">
                ⚡ HIGH FAULT CURRENT
              </text>
            </>
          ) : isOff && !isRestored ? (
            <>
              <path
                d="M84 116 C200 100, 300 132, 400 116 S600 100, 710 116"
                fill="none"
                stroke="#475569"
                strokeWidth="3"
              />
              <text x="400" y="262" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700">
                {visual === 'outage' ? 'UPSTREAM OUTAGE' : 'SUPPLY OFF'}
              </text>
            </>
          ) : (
            <>
              <path
                d="M84 116 C200 100, 300 132, 400 116 S600 100, 710 116"
                fill="none"
                stroke={showTransientDip ? '#fbbf24' : '#22d3ee'}
                strokeWidth="3"
                filter={isOff ? undefined : 'url(#glowCyan)'}
                opacity={showTransientDip ? 0.75 : 1}
              />
              {!isOff && (
                <path
                  d="M84 116 C200 100, 300 132, 400 116 S600 100, 710 116"
                  fill="none"
                  stroke={showTransientDip ? '#fde68a' : '#67e8f9'}
                  strokeWidth="2"
                  className="current-flow"
                  opacity="0.7"
                />
              )}
              <path
                d="M84 126 C200 110, 300 142, 400 126 S600 110, 710 126"
                fill="none"
                stroke={showTransientDip ? '#d97706' : '#38bdf8'}
                strokeWidth="2.2"
                opacity="0.85"
              />
              {showTransientDip && (
                <text x="400" y="262" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="700">
                  TRANSIENT DIP
                </text>
              )}
            </>
          )}

          <g transform="translate(720, 185)">
            <rect x="0" y="8" width="36" height="26" fill="#1e293b" stroke="#475569" />
            <polygon points="0,8 18,-4 36,8" fill="#334155" />
            <rect
              x="12"
              y="16"
              width="12"
              height="10"
              fill={
                isOff && visual !== 'sensor_fault'
                  ? '#1e293b'
                  : liveDanger || showShortFlash
                    ? '#fbbf24'
                    : '#22d3ee'
              }
              opacity={isOff && visual !== 'sensor_fault' ? 0.3 : 0.9}
            />
          </g>
        </svg>
      </div>

      {/* Telemetry strip */}
      <div className="mt-1.5 grid shrink-0 grid-cols-5 gap-1">
        <Metric label="V" value={feeder ? `${feeder.voltage}` : '—'} unit="V" alert={feeder && (feeder.voltage < 180 || feeder.voltage > 280)} />
        <Metric label="I" value={feeder ? `${feeder.current}` : '—'} unit="A" alert={feeder && (feeder.current > 100 || (feeder.current < 3 && feeder.status !== 'NORMAL' && feeder.status !== 'SENSOR_FAULT'))} />
        <Metric label="f" value={feeder ? `${feeder.frequency}` : '—'} unit="Hz" />
        <Metric label="φ" value={feeder?.phase ?? '—'} alert={feeder && feeder.phase !== 'ABC' && feeder.phase !== '—'} />
        <Metric label="Cont." value={feeder?.continuity ? 'OK' : 'OPEN'} alert={feeder && !feeder.continuity} />
      </div>
    </div>
  )
}

function Metric({ label, value, unit, alert }) {
  return (
    <div className="rounded-md bg-slate-900/90 px-1.5 py-1 text-center">
      <p className="text-[9px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`metric-value text-xs font-semibold ${alert ? 'text-rose-400' : 'text-cyan-300'}`}>
        {value}
        {unit && <span className="ml-0.5 text-[9px] font-normal text-slate-500">{unit}</span>}
      </p>
    </div>
  )
}
