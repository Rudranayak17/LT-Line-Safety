export default function ComparisonTable() {
  const rows = [
    ['Primary role', 'Local overcurrent / short-circuit trip', 'Multi-parameter pattern analysis'],
    ['Broken wire (low residual current)', 'May not trip', 'Designed to flag conductor-loss patterns'],
    ['Visibility', 'Limited local indication', 'Control-room dashboard + history'],
    ['Location hint', 'Usually feeder-level only', 'Feeder / pole zone on map'],
    ['Incident record', 'Minimal', 'Full event lifecycle in software'],
    ['Remote isolation', 'Not by default', 'Via certified remote switching gateway'],
  ]

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="panel-header">SIH talking point</p>
        <h3 className="text-base font-semibold text-white">
          Alongside breakers — not instead of them
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">Aspect</th>
              <th className="px-4 py-3 font-medium">Conventional breaker</th>
              <th className="px-4 py-3 font-medium text-cyan-400/90">This system</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([a, b, c]) => (
              <tr key={a} className="border-b border-slate-800/70 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-300">{a}</td>
                <td className="px-4 py-2.5 text-slate-500">{b}</td>
                <td className="px-4 py-2.5 text-slate-200">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
