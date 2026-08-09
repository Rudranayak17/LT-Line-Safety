/**
 * Procedural sound design via Web Audio API — no external audio files.
 * Used for alerts, warnings, UI feedback, and ambient cues during the demo.
 */

let ctx = null
let masterGain = null
let muted = false
let volume = 0.55
const activeLoops = new Map()

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    masterGain = ctx.createGain()
    masterGain.gain.value = muted ? 0 : volume
    masterGain.connect(ctx.destination)
  }
  return ctx
}

export async function unlockAudio() {
  const c = getCtx()
  if (!c) return false
  if (c.state === 'suspended') {
    try {
      await c.resume()
    } catch {
      return false
    }
  }
  return true
}

export function setMuted(next) {
  muted = Boolean(next)
  if (masterGain && ctx) {
    masterGain.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.02)
  }
  if (muted) stopAllLoops()
}

export function isMuted() {
  return muted
}

export function setVolume(v) {
  volume = Math.max(0, Math.min(1, v))
  if (masterGain && ctx && !muted) {
    masterGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.02)
  }
}

function tone({
  freq = 440,
  type = 'sine',
  duration = 0.2,
  attack = 0.01,
  decay = 0.08,
  sustain = 0.35,
  release = 0.12,
  gain = 0.2,
  freqEnd = null,
  delay = 0,
}) {
  const c = getCtx()
  if (!c || !masterGain || muted) return

  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (freqEnd != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), t0 + duration)
  }

  const peak = gain
  const sus = peak * sustain
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(peak, t0 + attack)
  g.gain.linearRampToValueAtTime(sus, t0 + attack + decay)
  g.gain.setValueAtTime(sus, t0 + Math.max(duration - release, attack + decay))
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  osc.connect(g)
  g.connect(masterGain)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

function noiseBurst({ duration = 0.15, gain = 0.12, filterFreq = 2000, delay = 0 } = {}) {
  const c = getCtx()
  if (!c || !masterGain || muted) return

  const len = Math.floor(c.sampleRate * duration)
  const buffer = c.createBuffer(1, len, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  }

  const t0 = c.currentTime + delay
  const src = c.createBufferSource()
  src.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = 0.8
  const g = c.createGain()
  g.gain.setValueAtTime(gain, t0)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  src.connect(filter)
  filter.connect(g)
  g.connect(masterGain)
  src.start(t0)
  src.stop(t0 + duration + 0.02)
}

/** Soft UI click */
export function playClick() {
  tone({ freq: 880, type: 'triangle', duration: 0.06, gain: 0.08, attack: 0.005, release: 0.04 })
  tone({ freq: 1320, type: 'sine', duration: 0.05, gain: 0.04, delay: 0.02 })
}

/** Demo start chirp */
export function playStart() {
  tone({ freq: 392, type: 'sine', duration: 0.12, gain: 0.12 })
  tone({ freq: 523, type: 'sine', duration: 0.14, gain: 0.12, delay: 0.1 })
  tone({ freq: 659, type: 'sine', duration: 0.18, gain: 0.14, delay: 0.2 })
}

/** Electrical crack / spark when wire breaks */
export function playSpark() {
  noiseBurst({ duration: 0.18, gain: 0.18, filterFreq: 3200 })
  noiseBurst({ duration: 0.12, gain: 0.1, filterFreq: 1800, delay: 0.08 })
  tone({ freq: 180, type: 'sawtooth', duration: 0.2, gain: 0.06, freqEnd: 60 })
  tone({ freq: 900, type: 'square', duration: 0.08, gain: 0.04, delay: 0.05 })
}

/** Warning: rising two-tone alert */
export function playWarning() {
  tone({ freq: 620, type: 'square', duration: 0.22, gain: 0.1, sustain: 0.5 })
  tone({ freq: 780, type: 'square', duration: 0.22, gain: 0.1, delay: 0.24, sustain: 0.5 })
  tone({ freq: 620, type: 'square', duration: 0.22, gain: 0.09, delay: 0.48, sustain: 0.5 })
  tone({ freq: 780, type: 'square', duration: 0.28, gain: 0.09, delay: 0.72, sustain: 0.4 })
}

/** Critical alarm — urgent multi-beep siren burst */
export function playCriticalAlert() {
  for (let i = 0; i < 5; i++) {
    const d = i * 0.18
    tone({
      freq: 880,
      type: 'square',
      duration: 0.12,
      gain: 0.14,
      delay: d,
      sustain: 0.6,
      attack: 0.005,
    })
    tone({
      freq: 1175,
      type: 'square',
      duration: 0.12,
      gain: 0.12,
      delay: d + 0.09,
      sustain: 0.5,
      attack: 0.005,
    })
  }
  // Low urgency thump
  tone({ freq: 90, type: 'sine', duration: 0.4, gain: 0.15, delay: 0.05, freqEnd: 55 })
}

/** Start looping soft alarm while critical (call stopAlarmLoop to end) */
export function startAlarmLoop() {
  stopLoop('alarm')
  const c = getCtx()
  if (!c || muted) return

  let cancelled = false
  const handle = { cancel: () => { cancelled = true } }
  activeLoops.set('alarm', handle)

  const pulse = () => {
    if (cancelled || muted) return
    tone({ freq: 740, type: 'square', duration: 0.1, gain: 0.07, sustain: 0.5 })
    tone({ freq: 980, type: 'square', duration: 0.1, gain: 0.06, delay: 0.12, sustain: 0.5 })
    const t = setTimeout(pulse, 900)
    handle.timer = t
  }
  pulse()
}

export function stopAlarmLoop() {
  stopLoop('alarm')
}

/** Isolation / breaker trip sound */
export function playIsolate() {
  // Mechanical clunk + power-down sweep
  noiseBurst({ duration: 0.08, gain: 0.14, filterFreq: 400 })
  tone({ freq: 220, type: 'sawtooth', duration: 0.15, gain: 0.1 })
  tone({ freq: 400, type: 'sine', duration: 0.55, gain: 0.12, freqEnd: 80, delay: 0.08 })
  tone({ freq: 150, type: 'triangle', duration: 0.35, gain: 0.08, delay: 0.2, freqEnd: 40 })
}

/** Success chime */
export function playSuccess() {
  tone({ freq: 523, type: 'sine', duration: 0.15, gain: 0.12 })
  tone({ freq: 659, type: 'sine', duration: 0.15, gain: 0.12, delay: 0.12 })
  tone({ freq: 784, type: 'sine', duration: 0.28, gain: 0.14, delay: 0.24 })
}

/** Soft acknowledge blip */
export function playAck() {
  tone({ freq: 660, type: 'sine', duration: 0.1, gain: 0.1 })
  tone({ freq: 880, type: 'sine', duration: 0.12, gain: 0.08, delay: 0.08 })
}

/** Dispatch radio-style blip */
export function playDispatch() {
  tone({ freq: 500, type: 'triangle', duration: 0.08, gain: 0.1 })
  tone({ freq: 500, type: 'triangle', duration: 0.08, gain: 0.1, delay: 0.14 })
  tone({ freq: 700, type: 'triangle', duration: 0.16, gain: 0.1, delay: 0.28 })
}

/** System reset */
export function playReset() {
  tone({ freq: 600, type: 'sine', duration: 0.1, gain: 0.08, freqEnd: 300 })
  tone({ freq: 300, type: 'sine', duration: 0.15, gain: 0.06, delay: 0.1, freqEnd: 150 })
}

/** Subtle tick while verifying */
export function playTick() {
  tone({ freq: 1200, type: 'sine', duration: 0.04, gain: 0.045, attack: 0.002, release: 0.03 })
}

function stopLoop(name) {
  const h = activeLoops.get(name)
  if (!h) return
  h.cancel?.()
  if (h.timer) clearTimeout(h.timer)
  activeLoops.delete(name)
}

export function stopAllLoops() {
  ;[...activeLoops.keys()].forEach(stopLoop)
}
