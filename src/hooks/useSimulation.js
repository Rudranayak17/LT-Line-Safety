import { useCallback, useEffect, useRef, useState } from 'react'
import {
  INITIAL_FEEDERS,
  INCIDENT_STAGES,
  randomNormalReading,
} from '../data/feeders'
import {
  SCENARIOS,
  SCENARIO_IDS,
  RESOLUTION,
  TIMELINE,
  getScenario,
  getRandomScenarioId,
} from '../data/scenarios'
import {
  unlockAudio,
  setMuted as setAudioMuted,
  playClick,
  playStart,
  playSpark,
  playWarning,
  playCriticalAlert,
  startAlarmLoop,
  stopAlarmLoop,
  playIsolate,
  playSuccess,
  playAck,
  playDispatch,
  playReset,
  playTick,
  stopAllLoops,
} from '../utils/audioEngine'
import {
  speak,
  cancelSpeech,
  setVoiceEnabled,
  isSpeechSupported,
} from '../utils/voiceAssistant'

export const PHASE = {
  IDLE: 'idle',
  NORMAL: 'normal',
  ANOMALY: 'anomaly',
  VERIFYING: 'verifying',
  CONFIRMED: 'confirmed',
  ISOLATING: 'isolating',
  ISOLATED: 'isolated',
  CLEARED: 'cleared', // transient / sensor resolved without isolation
  DISPATCHED: 'dispatched',
  RESTORED: 'restored',
}

function makeHistory(feeders) {
  const hist = {}
  feeders.forEach((f) => {
    hist[f.id] = Array.from({ length: 20 }, (_, i) => ({
      t: i,
      voltage: f.voltage + (Math.random() - 0.5) * 2,
      current: f.current + (Math.random() - 0.5) * 3,
    }))
  })
  return hist
}

function loadPref(key, defaultOn = true) {
  try {
    const v = localStorage.getItem(key)
    if (v === 'off') return false
    if (v === 'on') return true
  } catch { /* ignore */ }
  return defaultOn
}

function seedFeederReading(scenario, tick = 0, stage = 'fault') {
  try {
    return scenario.reading(Math.random, tick, stage)
  } catch {
    return scenario.reading(Math.random)
  }
}

export function useSimulation() {
  const [feeders, setFeeders] = useState(() =>
    INITIAL_FEEDERS.map((f) => ({ ...f }))
  )
  const [phase, setPhase] = useState(PHASE.NORMAL)
  const [scenarioId, setScenarioId] = useState(SCENARIO_IDS.BROKEN_CONDUCTOR)
  const [activeScenarioId, setActiveScenarioId] = useState(null)
  const [targetFeederId, setTargetFeederId] = useState('F-103')
  const [selectedId, setSelectedId] = useState('F-103')
  const [alerts, setAlerts] = useState([])
  const [events, setEvents] = useState([])
  const [incidentStage, setIncidentStage] = useState(null)
  const [verifyProgress, setVerifyProgress] = useState(0)
  const [detectionLog, setDetectionLog] = useState([])
  const [history, setHistory] = useState(() => makeHistory(INITIAL_FEEDERS))
  const [isDemoRunning, setIsDemoRunning] = useState(false)
  const [clock, setClock] = useState(() => new Date())
  const [soundOn, setSoundOn] = useState(() => loadPref('lt-sound', true))
  const [voiceOn, setVoiceOn] = useState(() => loadPref('lt-voice', true))
  const [voiceSubtitle, setVoiceSubtitle] = useState('')
  const [intermittentTick, setIntermittentTick] = useState(0)
  const [resolutionNote, setResolutionNote] = useState('')

  const speechOk = isSpeechSupported()
  const timers = useRef([])
  const soundOnRef = useRef(soundOn)
  const voiceOnRef = useRef(voiceOn)
  const phaseRef = useRef(phase)
  const targetRef = useRef(targetFeederId)
  const scenarioRef = useRef(null)
  const tickRef = useRef(0)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])
  useEffect(() => {
    targetRef.current = targetFeederId
  }, [targetFeederId])

  useEffect(() => {
    soundOnRef.current = soundOn
    setAudioMuted(!soundOn)
    try {
      localStorage.setItem('lt-sound', soundOn ? 'on' : 'off')
    } catch { /* ignore */ }
    if (!soundOn) stopAllLoops()
  }, [soundOn])

  useEffect(() => {
    voiceOnRef.current = voiceOn
    setVoiceEnabled(voiceOn)
    try {
      localStorage.setItem('lt-voice', voiceOn ? 'on' : 'off')
    } catch { /* ignore */ }
    if (!voiceOn) {
      cancelSpeech()
      setVoiceSubtitle('')
    }
  }, [voiceOn])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const schedule = (fn, ms) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
    return t
  }

  const sfx = useCallback((fn) => {
    if (soundOnRef.current) fn()
  }, [])

  const announce = useCallback((text, { interrupt = true } = {}) => {
    if (!text) return
    setVoiceSubtitle(text)
    if (voiceOnRef.current && isSpeechSupported()) {
      speak(text, { rate: 0.94, pitch: 1, interrupt })
    }
  }, [])

  const logEvent = useCallback((message, type = 'info') => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      type,
      at: new Date(),
    }
    setEvents((prev) => [entry, ...prev].slice(0, 50))
    return entry
  }, [])

  const pushAlert = useCallback((alert) => {
    setAlerts((prev) => [{ id: Date.now(), acknowledged: false, ...alert }, ...prev])
  }, [])

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // Live telemetry driven by active phase + scenario
  useEffect(() => {
    const faultPhases = [
      PHASE.ANOMALY,
      PHASE.VERIFYING,
      PHASE.CONFIRMED,
      PHASE.ISOLATING,
      PHASE.ISOLATED,
      PHASE.DISPATCHED,
      PHASE.CLEARED,
    ]
    const id = setInterval(() => {
      const sc = scenarioRef.current
      const tid = targetRef.current
      const ph = phaseRef.current
      tickRef.current += 1
      const tick = tickRef.current

      setFeeders((prev) => {
        const updated = prev.map((f) => {
          if (f.id === tid && sc && faultPhases.includes(ph)) {
            if (ph === PHASE.ISOLATED || ph === PHASE.DISPATCHED || f.isolated) {
              return {
                ...f,
                voltage: 0,
                current: 0,
                power: 0,
                frequency: 0,
                status: 'ISOLATED',
                isolated: true,
                phase: '—',
                continuity: false,
              }
            }
            if (ph === PHASE.CLEARED || ph === PHASE.RESTORED) {
              const base = INITIAL_FEEDERS.find((x) => x.id === f.id) || f
              const r = randomNormalReading(base)
              return {
                ...base,
                ...r,
                status: 'NORMAL',
                isolated: false,
                continuity: true,
                phase: 'ABC',
              }
            }
            if (
              ph === PHASE.ANOMALY ||
              ph === PHASE.VERIFYING ||
              ph === PHASE.CONFIRMED ||
              ph === PHASE.ISOLATING
            ) {
              // Short-circuit before trip: high current; after confirm may already be tripped
              let stage = 'fault'
              if (sc.id === SCENARIO_IDS.HIGH_CURRENT && ph === PHASE.CONFIRMED) {
                stage = 'tripped'
              }
              const br = seedFeederReading(sc, tick, stage)
              let status = 'WARNING'
              if (ph === PHASE.CONFIRMED || ph === PHASE.ISOLATING) {
                status = sc.statusOnConfirm || 'LINE_BREAK'
              }
              if (sc.id === SCENARIO_IDS.HIGH_CURRENT && stage === 'tripped') {
                status = 'ISOLATED'
              }
              if (sc.id === SCENARIO_IDS.INTERMITTENT && ph === PHASE.ANOMALY) {
                status = br.continuity ? 'WARNING' : 'WARNING'
              }
              return {
                ...f,
                ...br,
                status,
                isolated: Boolean(br.isolated),
              }
            }
          }
          if (f.isolated) {
            return {
              ...f,
              voltage: 0,
              current: 0,
              power: 0,
              frequency: 0,
              status: 'ISOLATED',
            }
          }
          if (f.status === 'SENSOR_FAULT' && f.id !== tid) {
            return f
          }
          if (f.status === 'OUTAGE' && f.id !== tid) {
            return f
          }
          if (f.status === 'NORMAL' || f.id !== tid) {
            const base = INITIAL_FEEDERS.find((x) => x.id === f.id) || f
            const r = randomNormalReading(base)
            return {
              ...f,
              ...r,
              status: f.id === tid && ph === PHASE.RESTORED ? 'NORMAL' : f.status === 'NORMAL' || f.id !== tid ? 'NORMAL' : f.status,
              continuity: true,
              phase: 'ABC',
              isolated: false,
            }
          }
          return f
        })

        // Keep non-target feeders gently live when normal
        const fixed = updated.map((f) => {
          if (f.id !== tid && !f.isolated && f.status !== 'SENSOR_FAULT') {
            const base = INITIAL_FEEDERS.find((x) => x.id === f.id) || f
            if (f.status === 'NORMAL' || !faultPhases.includes(ph)) {
              const r = randomNormalReading(base)
              return { ...f, ...r, status: 'NORMAL', continuity: true, phase: 'ABC' }
            }
          }
          return f
        })

        setHistory((hist) => {
          const next = { ...hist }
          fixed.forEach((f) => {
            const series = next[f.id] || []
            next[f.id] = [
              ...series.slice(-29),
              {
                t: (series[series.length - 1]?.t ?? 0) + 1,
                voltage: f.voltage,
                current: f.current,
              },
            ]
          })
          return next
        })

        if (sc?.id === SCENARIO_IDS.INTERMITTENT) {
          setIntermittentTick(tick)
        }

        return fixed
      })
    }, 1100)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (phase !== PHASE.VERIFYING) return undefined
    const id = setInterval(() => sfx(playTick), 400)
    return () => clearInterval(id)
  }, [phase, sfx])

  const applyFaultReading = useCallback((sc, feederId, status, stage = 'fault') => {
    const br = seedFeederReading(sc, tickRef.current, stage)
    setFeeders((prev) =>
      prev.map((f) =>
        f.id === feederId
          ? {
              ...f,
              ...br,
              status,
              isolated: Boolean(br.isolated) || status === 'ISOLATED',
            }
          : f
      )
    )
  }, [])

  const isolateFeeder = useCallback((feederId) => {
    setFeeders((prev) =>
      prev.map((f) =>
        f.id === feederId
          ? {
              ...f,
              voltage: 0,
              current: 0,
              power: 0,
              frequency: 0,
              status: 'ISOLATED',
              isolated: true,
              continuity: false,
              phase: '—',
            }
          : f
      )
    )
  }, [])

  const restoreFeeder = useCallback((feederId) => {
    const base = INITIAL_FEEDERS.find((x) => x.id === feederId)
    setFeeders((prev) =>
      prev.map((f) =>
        f.id === feederId
          ? { ...base, status: 'NORMAL', isolated: false }
          : f
      )
    )
  }, [])

  const resetDemo = useCallback(() => {
    clearTimers()
    stopAllLoops()
    cancelSpeech()
    scenarioRef.current = null
    setActiveScenarioId(null)
    setIsDemoRunning(false)
    setPhase(PHASE.NORMAL)
    setVerifyProgress(0)
    setIncidentStage(null)
    setDetectionLog([])
    setFeeders(INITIAL_FEEDERS.map((f) => ({ ...f })))
    setHistory(makeHistory(INITIAL_FEEDERS))
    setAlerts([])
    setEvents([])
    setResolutionNote('')
    setIntermittentTick(0)
    const sc = getScenario(scenarioId)
    setTargetFeederId(sc.defaultFeederId)
    setSelectedId(sc.defaultFeederId)
    sfx(playReset)
    announce('System reset. All feeders returned to normal. Select a condition and run the simulation.')
    logEvent('System reset — all feeders NORMAL', 'info')
  }, [logEvent, sfx, announce, scenarioId])

  /**
   * Run dynamic scenario simulation.
   * @param {string} [overrideId] scenario id; defaults to selected scenarioId
   * @param {string} [overrideFeeder] feeder id
   */
  const runScenario = useCallback(
    async (overrideId, overrideFeeder) => {
      await unlockAudio()
      clearTimers()
      stopAllLoops()
      cancelSpeech()
      tickRef.current = 0

      const sc = getScenario(overrideId || scenarioId)
      const feederId = overrideFeeder || sc.defaultFeederId
      const feederMeta = INITIAL_FEEDERS.find((f) => f.id === feederId) || INITIAL_FEEDERS[0]

      scenarioRef.current = sc
      setActiveScenarioId(sc.id)
      setScenarioId(sc.id)
      setTargetFeederId(feederId)
      setSelectedId(feederId)
      targetRef.current = feederId

      setIsDemoRunning(true)
      setAlerts([])
      setDetectionLog([])
      setVerifyProgress(0)
      setIncidentStage(null)
      setResolutionNote('')
      setFeeders(INITIAL_FEEDERS.map((f) => ({ ...f })))
      setPhase(PHASE.NORMAL)

      logEvent(`Demo: ${sc.name} on ${feederId} (${feederMeta.zone})`, 'info')
      setDetectionLog([{ step: 'sense', status: 'ok', note: 'Field units streaming' }])
      sfx(playStart)
      announce(sc.voice.start)

      // —— ANOMALY ——
      schedule(() => {
        setPhase(PHASE.ANOMALY)
        applyFaultReading(sc, feederId, 'WARNING')
        sfx(playSpark)
        schedule(() => sfx(playWarning), 250)
        announce(sc.voice.anomaly)
        logEvent(`${sc.shortName}: abnormal pattern on ${feederId}`, 'warning')
        setDetectionLog([
          { step: 'sense', status: 'ok', note: sc.rules[0] || 'Anomaly captured' },
          { step: 'stream', status: 'ok', note: 'POST /api/readings' },
          { step: 'analyze', status: 'active', note: 'Matching scenario rules…' },
        ])
      }, TIMELINE.anomaly)

      // —— VERIFYING ——
      schedule(() => {
        setPhase(PHASE.VERIFYING)
        setIncidentStage(0)
        announce(sc.voice.verifying)
        logEvent('Verification window — condition must persist', 'warning')
        setDetectionLog((d) => [
          ...d.filter((x) => x.step !== 'analyze'),
          { step: 'analyze', status: 'ok', note: `Candidate: ${sc.classifyLabel}` },
          { step: 'verify', status: 'active', note: 'Safety hold…' },
        ])
        let p = 0
        const step = () => {
          p += 7
          setVerifyProgress(Math.min(p, 100))
          if (p < 100) schedule(step, 180)
        }
        step()
      }, TIMELINE.verifying)

      // —— CONFIRMED / CLASSIFIED ——
      schedule(() => {
        setVerifyProgress(100)
        setIncidentStage(1)

        // Transient: clears during/after verify — no critical isolation path
        if (sc.resolution === RESOLUTION.AUTO_CLEAR && sc.id === SCENARIO_IDS.TRANSIENT) {
          setPhase(PHASE.CLEARED)
          restoreFeeder(feederId)
          setResolutionNote(sc.resolutionLabel)
          announce(sc.voice.confirmed)
          schedule(() => announce(sc.voice.resolve, { interrupt: false }), 3500)
          sfx(playSuccess)
          pushAlert({
            severity: 'INFO',
            title: sc.alertTitle,
            feeder: feederId,
            zone: feederMeta.zone,
            pole: feederMeta.pole,
            message: sc.description,
            scenarioId: sc.id,
          })
          logEvent(`CLEARED: Transient on ${feederId} — no isolation`, 'success')
          setDetectionLog([
            { step: 'sense', status: 'ok', note: 'Dip observed' },
            { step: 'stream', status: 'ok', note: 'Streamed' },
            { step: 'analyze', status: 'ok', note: 'Did not persist' },
            { step: 'verify', status: 'ok', note: 'Cleared in hold window' },
            { step: 'classify', status: 'ok', note: 'TRANSIENT' },
            { step: 'isolate', status: 'ok', note: 'Skipped — no isolation' },
            { step: 'alert', status: 'ok', note: 'Logged for analytics' },
          ])
          setIsDemoRunning(false)
          setIncidentStage(6)
          return
        }

        if (sc.resolution === RESOLUTION.AUTO_CLEAR && sc.id === SCENARIO_IDS.SENSOR_FAULT) {
          setPhase(PHASE.CONFIRMED)
          applyFaultReading(sc, feederId, 'SENSOR_FAULT')
          setResolutionNote(sc.resolutionLabel)
          sfx(playWarning)
          announce(sc.voice.confirmed)
          pushAlert({
            severity: 'WARNING',
            title: sc.alertTitle,
            feeder: feederId,
            zone: feederMeta.zone,
            pole: feederMeta.pole,
            message: sc.description,
            scenarioId: sc.id,
          })
          logEvent(`SENSOR_FAULT on ${feederId} — feeder stays ON`, 'warning')
          setDetectionLog([
            { step: 'sense', status: 'ok', note: 'Impossible values' },
            { step: 'stream', status: 'ok', note: 'Streamed' },
            { step: 'analyze', status: 'ok', note: 'Neighbors NORMAL' },
            { step: 'verify', status: 'ok', note: 'Cross-check passed' },
            { step: 'classify', status: 'ok', note: 'SENSOR_FAULT' },
            { step: 'isolate', status: 'ok', note: 'Blocked — do not isolate' },
            { step: 'alert', status: 'ok', note: 'Maintenance ticket' },
          ])
          setIncidentStage(1)
          // auto "resolve" path for sensor: dispatch maintenance then restore readings
          schedule(() => {
            announce(sc.voice.resolve)
            setPhase(PHASE.DISPATCHED)
            setIncidentStage(4)
            logEvent('Maintenance team ticket created for field unit', 'info')
            setIsDemoRunning(false)
          }, 4000)
          return
        }

        if (sc.resolution === RESOLUTION.MONITOR_ONLY) {
          setPhase(PHASE.CONFIRMED)
          applyFaultReading(sc, feederId, 'OUTAGE')
          setResolutionNote(sc.resolutionLabel)
          sfx(playWarning)
          announce(sc.voice.confirmed)
          pushAlert({
            severity: 'WARNING',
            title: sc.alertTitle,
            feeder: feederId,
            zone: feederMeta.zone,
            pole: feederMeta.pole,
            message: sc.description,
            scenarioId: sc.id,
          })
          logEvent(`OUTAGE classified on ${feederId} — monitor only`, 'warning')
          setDetectionLog([
            { step: 'sense', status: 'ok', note: 'Clean zero V/I' },
            { step: 'stream', status: 'ok', note: 'Streamed' },
            { step: 'analyze', status: 'ok', note: 'No earth residual' },
            { step: 'verify', status: 'ok', note: 'Outage pattern' },
            { step: 'classify', status: 'ok', note: 'OUTAGE' },
            { step: 'isolate', status: 'ok', note: 'N/A — upstream' },
            { step: 'alert', status: 'ok', note: 'Control room notified' },
          ])
          setIncidentStage(1)
          schedule(() => {
            // Simulate upstream restore
            restoreFeeder(feederId)
            setPhase(PHASE.RESTORED)
            setIncidentStage(6)
            setResolutionNote('Upstream supply restored')
            sfx(playSuccess)
            announce(sc.voice.resolve)
            logEvent(`Upstream restored — ${feederId} NORMAL`, 'success')
            setIsDemoRunning(false)
          }, TIMELINE.resolveAction - TIMELINE.confirmed + 2000)
          return
        }

        if (sc.resolution === RESOLUTION.BREAKER_TRIP) {
          setPhase(PHASE.CONFIRMED)
          applyFaultReading(sc, feederId, 'ISOLATED', 'tripped')
          isolateFeeder(feederId)
          setResolutionNote(sc.resolutionLabel)
          sfx(() => {
            playCriticalAlert()
            playIsolate()
          })
          announce(sc.voice.confirmed)
          pushAlert({
            severity: 'CRITICAL',
            title: sc.alertTitle,
            feeder: feederId,
            zone: feederMeta.zone,
            pole: feederMeta.pole,
            message: sc.description,
            scenarioId: sc.id,
          })
          logEvent(`BREAKER TRIP on ${feederId} — hardware protection`, 'critical')
          setDetectionLog([
            { step: 'sense', status: 'ok', note: 'I >> threshold' },
            { step: 'stream', status: 'ok', note: 'Streamed' },
            { step: 'analyze', status: 'ok', note: 'Short-circuit signature' },
            { step: 'verify', status: 'ok', note: 'Local trip expected' },
            { step: 'classify', status: 'ok', note: 'SHORT_CIRCUIT' },
            { step: 'isolate', status: 'ok', note: 'Breaker opened (local)' },
            { step: 'alert', status: 'ok', note: 'Logged + dashboard' },
          ])
          setIncidentStage(3)
          schedule(() => {
            announce(sc.voice.resolve)
            setIsDemoRunning(false)
          }, 3500)
          return
        }

        // AUTO_ISOLATE + ESCALATE (intermittent → break)
        setPhase(PHASE.CONFIRMED)
        const confirmStatus = sc.statusOnConfirm || 'LINE_BREAK'
        applyFaultReading(sc, feederId, confirmStatus)
        sfx(() => {
          playCriticalAlert()
          startAlarmLoop()
        })
        announce(sc.voice.confirmed)
        pushAlert({
          severity: sc.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          title: sc.alertTitle,
          feeder: feederId,
          zone: feederMeta.zone,
          pole: feederMeta.pole,
          message: sc.description,
          scenarioId: sc.id,
        })
        logEvent(
          `CONFIRMED ${sc.classifyLabel} on ${feederId}${
            sc.resolution === RESOLUTION.ESCALATE ? ' (escalated)' : ''
          }`,
          'critical'
        )
        setDetectionLog([
          { step: 'sense', status: 'ok', note: sc.rules[0] },
          { step: 'stream', status: 'ok', note: 'Streamed' },
          { step: 'analyze', status: 'ok', note: sc.rules.slice(0, 2).join('; ') },
          { step: 'verify', status: 'ok', note: 'Persisted' },
          {
            step: 'classify',
            status: 'ok',
            note: sc.classifyLabel + (sc.resolution === RESOLUTION.ESCALATE ? ' (escalated)' : ''),
          },
          { step: 'isolate', status: 'active', note: 'Awaiting isolation…' },
          { step: 'alert', status: 'ok', note: 'HIGH PRIORITY' },
        ])
      }, TIMELINE.confirmed)

      // —— RESOLVE: isolation for auto_isolate / escalate ——
      schedule(() => {
        const scNow = scenarioRef.current
        if (!scNow) return
        if (
          scNow.resolution !== RESOLUTION.AUTO_ISOLATE &&
          scNow.resolution !== RESOLUTION.ESCALATE
        ) {
          return
        }
        setPhase(PHASE.ISOLATING)
        setIncidentStage(2)
        announce('Shutdown command issued through secure API to control gateway.')
        logEvent(`Isolation command → gateway for ${feederId}`, 'critical')
        setDetectionLog((d) => [
          ...d.filter((x) => x.step !== 'isolate'),
          { step: 'isolate', status: 'active', note: 'Secure API → remote switch' },
          { step: 'alert', status: 'ok', note: 'Dept notified' },
        ])
      }, TIMELINE.resolveAction)

      schedule(() => {
        const scNow = scenarioRef.current
        if (!scNow) return
        if (
          scNow.resolution !== RESOLUTION.AUTO_ISOLATE &&
          scNow.resolution !== RESOLUTION.ESCALATE
        ) {
          return
        }
        setPhase(PHASE.ISOLATED)
        setIncidentStage(3)
        isolateFeeder(feederId)
        setResolutionNote(scNow.resolutionLabel)
        sfx(() => {
          stopAlarmLoop()
          playIsolate()
          setTimeout(() => {
            if (soundOnRef.current) playSuccess()
          }, 450)
        })
        announce(scNow.voice.resolve)
        logEvent(`${feederId} isolated — supply OFF (${scNow.shortName})`, 'success')
        setDetectionLog((d) => [
          ...d.filter((x) => x.step !== 'isolate'),
          { step: 'isolate', status: 'ok', note: 'Line OFF confirmed' },
          { step: 'alert', status: 'ok', note: 'Crew can be dispatched' },
        ])
        setIsDemoRunning(false)
      }, TIMELINE.done)
    },
    [
      scenarioId,
      logEvent,
      sfx,
      announce,
      applyFaultReading,
      isolateFeeder,
      restoreFeeder,
      pushAlert,
    ]
  )

  const runLineBreakDemo = useCallback(() => runScenario(scenarioId), [runScenario, scenarioId])

  const runRandomScenario = useCallback(() => {
    const id = getRandomScenarioId()
    return runScenario(id)
  }, [runScenario])

  const acknowledgeAlert = useCallback(
    (id) => {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)))
      sfx(playAck)
      announce('Alert acknowledged by control room operator.', { interrupt: false })
      logEvent('Alert acknowledged by operator', 'info')
    },
    [logEvent, sfx, announce]
  )

  const dispatchTeam = useCallback(() => {
    if (
      phase !== PHASE.ISOLATED &&
      phase !== PHASE.DISPATCHED &&
      phase !== PHASE.CONFIRMED &&
      phase !== PHASE.CLEARED
    ) {
      // allow dispatch after breaker trip / sensor
      if (phase !== PHASE.CONFIRMED && phase !== PHASE.ISOLATED) return
    }
    const sc = scenarioRef.current || getScenario(activeScenarioId || scenarioId)
    setPhase(PHASE.DISPATCHED)
    setIncidentStage(4)
    sfx(playDispatch)
    announce(
      sc.needsDispatch
        ? `Field crew dispatched to ${targetFeederId}. Follow safety procedures.`
        : 'Response team notified.'
    )
    logEvent(`Team dispatched for ${targetFeederId} (${sc.shortName})`, 'success')
  }, [phase, logEvent, sfx, announce, activeScenarioId, scenarioId, targetFeederId])

  const completeRepair = useCallback(() => {
    const sc = scenarioRef.current || getScenario(activeScenarioId || scenarioId)
    if (
      phase !== PHASE.DISPATCHED &&
      phase !== PHASE.ISOLATED &&
      phase !== PHASE.CONFIRMED &&
      phase !== PHASE.CLEARED
    ) {
      return
    }
    setIncidentStage(5)
    sfx(playClick)
    schedule(() => {
      setIncidentStage(6)
      setPhase(PHASE.RESTORED)
      restoreFeeder(targetFeederId)
      setResolutionNote(`Resolved: ${sc.resolutionLabel}`)
      sfx(playSuccess)
      announce(
        `Issue resolved on ${targetFeederId}. Feeder restored to normal service. Monitoring continues.`
      )
      logEvent(`Repair/resolve complete — ${targetFeederId} RESTORED`, 'success')
      setIsDemoRunning(false)
    }, 1200)
  }, [phase, logEvent, sfx, announce, activeScenarioId, scenarioId, targetFeederId, restoreFeeder])

  const isolateManually = useCallback(async () => {
    const sc = scenarioRef.current || getScenario(activeScenarioId || scenarioId)
    if (!sc.needsIsolation && sc.resolution !== RESOLUTION.AUTO_ISOLATE && sc.resolution !== RESOLUTION.ESCALATE) {
      logEvent('Isolation not applicable for this condition', 'warning')
      announce('Isolation is not required for this classified condition.')
      return
    }
    if (
      phase !== PHASE.CONFIRMED &&
      phase !== PHASE.ANOMALY &&
      phase !== PHASE.VERIFYING
    ) {
      return
    }
    await unlockAudio()
    clearTimers()
    setIsDemoRunning(false)
    setPhase(PHASE.ISOLATING)
    setIncidentStage(2)
    sfx(playClick)
    announce('Manual isolation requested by operator. Sending shutdown command now.')
    logEvent('Manual isolation requested', 'critical')
    schedule(() => {
      setPhase(PHASE.ISOLATED)
      setIncidentStage(3)
      isolateFeeder(targetFeederId)
      setResolutionNote('Manual remote isolation')
      sfx(() => {
        stopAlarmLoop()
        playIsolate()
        setTimeout(() => {
          if (soundOnRef.current) playSuccess()
        }, 400)
      })
      announce('Isolation complete. Supply off.')
      logEvent(`${targetFeederId} isolated — supply OFF`, 'success')
    }, 1600)
  }, [phase, logEvent, sfx, announce, activeScenarioId, scenarioId, targetFeederId, isolateFeeder])

  const selectScenario = useCallback((id) => {
    if (isDemoRunning) return
    setScenarioId(id)
    const sc = getScenario(id)
    setTargetFeederId(sc.defaultFeederId)
    setSelectedId(sc.defaultFeederId)
    sfx(playClick)
  }, [isDemoRunning, sfx])

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v
      if (next) unlockAudio().then(() => playClick())
      return next
    })
  }, [])

  const toggleVoice = useCallback(() => {
    setVoiceOn((v) => {
      if (v) {
        cancelSpeech()
        setVoiceSubtitle('')
      } else if (isSpeechSupported()) {
        setTimeout(() => {
          speak('Voice assistance enabled.', { interrupt: true, rate: 1 })
          setVoiceSubtitle('Voice assistance enabled.')
        }, 80)
      }
      return !v
    })
  }, [])

  const clearVoiceSubtitle = useCallback(() => setVoiceSubtitle(''), [])

  useEffect(
    () => () => {
      clearTimers()
      stopAllLoops()
      cancelSpeech()
    },
    []
  )

  const counts = {
    normal: feeders.filter((f) => f.status === 'NORMAL').length,
    warning: feeders.filter((f) =>
      ['WARNING', 'OUTAGE', 'SENSOR_FAULT'].includes(f.status)
    ).length,
    critical: feeders.filter((f) => f.status === 'LINE_BREAK').length,
    isolated: feeders.filter((f) => f.status === 'ISOLATED').length,
  }

  const selected = feeders.find((f) => f.id === selectedId) || feeders[0]
  const targetFeeder = feeders.find((f) => f.id === targetFeederId) || feeders[0]
  const activeScenario = activeScenarioId
    ? getScenario(activeScenarioId)
    : getScenario(scenarioId)
  const selectedScenario = getScenario(scenarioId)

  // Dynamic incident stages based on resolution
  const incidentStages = (() => {
    const sc = activeScenario
    if (sc.resolution === RESOLUTION.AUTO_CLEAR && sc.id === SCENARIO_IDS.TRANSIENT) {
      return ['Detected', 'Verifying', 'Cleared (transient)', 'Logged', 'System Normal']
    }
    if (sc.resolution === RESOLUTION.AUTO_CLEAR && sc.id === SCENARIO_IDS.SENSOR_FAULT) {
      return [
        'Detected',
        'Classified sensor fault',
        'Maintenance ticket',
        'Tech dispatched',
        'Device fixed',
        'System Normal',
      ]
    }
    if (sc.resolution === RESOLUTION.MONITOR_ONLY) {
      return ['Detected', 'Classified outage', 'Notify ops', 'Upstream restore', 'System Normal']
    }
    if (sc.resolution === RESOLUTION.BREAKER_TRIP) {
      return [
        'Detected',
        'High current',
        'Breaker tripped',
        'Team dispatched',
        'Fault repaired',
        'System Restored',
      ]
    }
    return INCIDENT_STAGES
  })()

  return {
    feeders,
    selected,
    selectedId,
    setSelectedId,
    phase,
    alerts,
    events,
    incidentStage,
    incidentStages,
    verifyProgress,
    detectionLog,
    history,
    isDemoRunning,
    clock,
    counts,
    targetFeeder,
    targetFeederId,
    TARGET_FEEDER: targetFeederId,
    scenarioId,
    activeScenarioId,
    activeScenario,
    selectedScenario,
    scenarios: SCENARIOS,
    resolutionNote,
    intermittentTick,
    selectScenario,
    runScenario,
    runLineBreakDemo,
    runRandomScenario,
    resetDemo,
    acknowledgeAlert,
    dispatchTeam,
    completeRepair,
    isolateManually,
    soundOn,
    voiceOn,
    speechOk,
    voiceSubtitle,
    clearVoiceSubtitle,
    toggleSound,
    toggleVoice,
  }
}
