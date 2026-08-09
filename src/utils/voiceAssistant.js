/**
 * Voice assistance via Web Speech API (browser TTS).
 * Narrates the line-break demo like a control-room assistant.
 */

let voiceEnabled = true
let preferredVoice = null
let lastSpoken = ''
let speaking = false

const queue = []

export function setVoiceEnabled(on) {
  voiceEnabled = Boolean(on)
  if (!voiceEnabled) {
    cancelSpeech()
  }
}

export function isVoiceEnabled() {
  return voiceEnabled
}

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function pickVoice() {
  if (!isSpeechSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  // Prefer clear English voices (India / UK / US)
  const prefer = [
    (v) => /en-IN/i.test(v.lang) && /female|google|natural/i.test(v.name),
    (v) => /en-IN/i.test(v.lang),
    (v) => /en-GB/i.test(v.lang) && /female|google|natural/i.test(v.name),
    (v) => /en-US/i.test(v.lang) && /samantha|google|natural|aria|jenny/i.test(v.name),
    (v) => /en-US/i.test(v.lang),
    (v) => /^en/i.test(v.lang),
  ]

  for (const rule of prefer) {
    const found = voices.find(rule)
    if (found) return found
  }
  return voices[0]
}

function ensureVoice() {
  if (preferredVoice) return preferredVoice
  preferredVoice = pickVoice()
  return preferredVoice
}

// Chrome loads voices async
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = pickVoice()
  }
}

export function cancelSpeech() {
  queue.length = 0
  speaking = false
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel()
  }
}

function flushQueue() {
  if (speaking || !queue.length || !voiceEnabled) return
  const next = queue.shift()
  speakNow(next.text, next.options)
}

function speakNow(text, options = {}) {
  if (!isSpeechSupported() || !voiceEnabled) {
    speaking = false
    flushQueue()
    return
  }

  const {
    rate = 1,
    pitch = 1,
    volume = 1,
    onEnd,
  } = options

  const u = new SpeechSynthesisUtterance(text)
  const voice = ensureVoice()
  if (voice) u.voice = voice
  u.lang = voice?.lang || 'en-IN'
  u.rate = rate
  u.pitch = pitch
  u.volume = volume

  speaking = true
  lastSpoken = text

  u.onend = () => {
    speaking = false
    onEnd?.()
    flushQueue()
  }
  u.onerror = () => {
    speaking = false
    onEnd?.()
    flushQueue()
  }

  // Small delay helps Chrome after cancel / first user gesture
  setTimeout(() => {
    if (!voiceEnabled) {
      speaking = false
      return
    }
    try {
      window.speechSynthesis.speak(u)
    } catch {
      speaking = false
      flushQueue()
    }
  }, 50)
}

/**
 * Speak text. Queues if already speaking (unless interrupt).
 */
export function speak(text, options = {}) {
  if (!text || !voiceEnabled || !isSpeechSupported()) return

  const { priority = 'normal', interrupt = false } = options

  if (interrupt || priority === 'high') {
    cancelSpeech()
    speakNow(text, options)
    return
  }

  if (speaking || window.speechSynthesis.speaking) {
    queue.push({ text, options })
    return
  }

  speakNow(text, options)
}

export function getLastSpoken() {
  return lastSpoken
}

/** Scripted narration for each demo phase */
export const VOICE_SCRIPTS = {
  demoStart:
    'Voice assistance online. Beginning LT line break simulation. All feeders are currently normal. Field sensors are streaming live telemetry.',
  anomaly:
    'Warning. Abnormal electrical pattern detected on Feeder F one zero three, Pole P forty one, Ward seven residential zone. Voltage collapse and phase imbalance observed. Possible conductor loss.',
  verifying:
    'Detection engine active. Verification window started. Condition must persist before isolation. Analysing voltage, current, and phase signature against conductor break rules.',
  confirmed:
    'Critical alert. Line break confirmed on Feeder F one zero three. Residual current may not trip a conventional circuit breaker. High priority alert sent to control room. Isolation recommended immediately.',
  isolating:
    'Shutdown command issued through secure A P I to control gateway. Requesting remote isolation from certified switching equipment.',
  isolated:
    'Isolation complete. Feeder F one zero three supply is off. Hazard de-energized for field crew. Electricity department has been notified.',
  dispatched:
    'Field crew dispatched to Pole P forty one. Please follow safety procedures. Repair status will update when work is complete.',
  restored:
    'Repair completed. Feeder F one zero three restored to normal service. System monitoring continues.',
  reset:
    'System reset. All feeders returned to normal. Voice assistance standing by.',
  acknowledge:
    'Alert acknowledged by control room operator.',
  manualIsolate:
    'Manual isolation requested by operator. Sending shutdown command now.',
}
