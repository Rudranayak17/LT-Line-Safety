import {
  ShieldAlert,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Shuffle,
} from 'lucide-react'

export default function Header({
  clock,
  isDemoRunning,
  onRunDemo,
  onRandom,
  onReset,
  soundOn,
  voiceOn,
  speechOk,
  onToggleSound,
  onToggleVoice,
  scenarioName,
  tab,
  onTab,
}) {
  const time = clock.toLocaleTimeString('en-IN', { hour12: true })

  return (
    <header className="z-40 shrink-0 border-b border-slate-800/80 bg-[#070b14]/95 backdrop-blur-xl">
      <div className="flex h-12 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-cyan-500/30">
            <ShieldAlert className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-white">
              LT Line Safety
            </h1>
            <p className="hidden truncate text-[10px] text-slate-500 sm:block">
              {scenarioName || 'Select condition'} · {time}
            </p>
          </div>
        </div>

        <div className="live-badge !px-2 !py-0.5 !text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
          LIVE
        </div>

        <nav className="ml-1 hidden items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-900/50 p-0.5 md:flex">
          {[
            { id: 'ops', label: 'Ops' },
            { id: 'analytics', label: 'Map' },
            { id: 'about', label: 'SIH' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                tab === t.id
                  ? 'bg-cyan-500/15 text-cyan-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              onClick={() => onTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-700/80 bg-slate-900/60 p-0.5">
            <button
              type="button"
              className={`rounded-md p-1.5 ${
                soundOn ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-500'
              }`}
              onClick={onToggleSound}
              title="Sounds"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              className={`rounded-md p-1.5 ${
                !speechOk
                  ? 'text-slate-700'
                  : voiceOn
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-slate-500'
              }`}
              onClick={onToggleVoice}
              disabled={!speechOk}
              title="Voice"
            >
              {voiceOn ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          <button
            type="button"
            className="btn btn-ghost !px-2 !py-1.5 text-xs"
            onClick={onRandom}
            disabled={isDemoRunning}
            title="Random"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="btn btn-primary !px-2.5 !py-1.5 text-xs"
            onClick={onRunDemo}
            disabled={isDemoRunning}
          >
            <Play className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isDemoRunning ? '…' : 'Run'}</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost !px-2 !py-1.5 text-xs"
            onClick={onReset}
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex gap-1 border-t border-slate-800/80 px-2 py-1 md:hidden">
        {[
          { id: 'ops', label: 'Ops' },
          { id: 'analytics', label: 'Map' },
          { id: 'about', label: 'SIH' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            className={`flex-1 rounded-md py-1 text-xs ${
              tab === t.id ? 'bg-cyan-500/15 text-cyan-300' : 'text-slate-500'
            }`}
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </header>
  )
}
