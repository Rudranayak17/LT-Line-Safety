import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

/** Fills parent height — use inside a sized flex/grid cell */
export default function MetricsChart({ history, feederId, feeder }) {
  const data = history[feederId] || []

  return (
    <div className="panel flex h-full min-h-0 flex-col overflow-hidden p-2.5">
      <div className="mb-1.5 flex shrink-0 flex-wrap items-center justify-between gap-1">
        <div>
          <p className="panel-header !text-[9px]">Telemetry</p>
          <h3 className="text-xs font-semibold text-white">Voltage &amp; current · {feederId}</h3>
        </div>
        {feeder && (
          <div className="flex gap-2 font-mono text-[10px]">
            <span className="text-cyan-400">{feeder.voltage} V</span>
            <span className="text-violet-400">{feeder.current} A</span>
          </div>
        )}
      </div>
      <div className="min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="t" hide />
            <YAxis
              yAxisId="v"
              domain={['auto', 'auto']}
              stroke="#475569"
              fontSize={9}
              width={30}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              yAxisId="i"
              orientation="right"
              domain={['auto', 'auto']}
              stroke="#475569"
              fontSize={9}
              width={30}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 11,
              }}
              labelStyle={{ display: 'none' }}
            />
            <Line
              yAxisId="v"
              type="monotone"
              dataKey="voltage"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Voltage (V)"
            />
            <Line
              yAxisId="i"
              type="monotone"
              dataKey="current"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Current (A)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
