import { Volume2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function VoiceBanner({ text, voiceOn, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (text && voiceOn) setVisible(true)
  }, [text, voiceOn])

  if (!visible || !text || !voiceOn) return null

  return (
    <div className="pointer-events-none fixed bottom-2 left-1/2 z-50 w-[min(520px,calc(100%-1rem))] -translate-x-1/2">
      <div className="pointer-events-auto flex items-start gap-2 rounded-xl border border-cyan-500/30 bg-slate-950/95 px-3 py-2 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
        <Volume2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400 pulse-dot" />
        <p className="line-clamp-2 flex-1 text-[11px] leading-snug text-slate-200">{text}</p>
        <button
          type="button"
          className="rounded p-0.5 text-slate-500 hover:text-slate-300"
          onClick={() => {
            setVisible(false)
            onDismiss?.()
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
