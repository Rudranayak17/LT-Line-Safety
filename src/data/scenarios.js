/**
 * Dynamic fault scenarios for the LT Line Safety simulation.
 * Each scenario has a unique electrical signature, detection path, and resolution.
 */

export const SCENARIO_IDS = {
  BROKEN_CONDUCTOR: 'broken_conductor',
  FALLEN_LIVE: 'fallen_live',
  PHASE_OPEN: 'phase_open',
  INTERMITTENT: 'intermittent',
  TRANSIENT: 'transient',
  SENSOR_FAULT: 'sensor_fault',
  OUTAGE: 'outage',
  HIGH_CURRENT: 'high_current',
}

/** How the system resolves each condition after confirmation */
export const RESOLUTION = {
  AUTO_ISOLATE: 'auto_isolate', // software requests remote isolation
  MONITOR_ONLY: 'monitor_only', // alert but no isolation (e.g. outage)
  AUTO_CLEAR: 'auto_clear', // condition self-clears (transient / sensor)
  BREAKER_TRIP: 'breaker_trip', // conventional protection handles it
  ESCALATE: 'escalate', // intermittent escalates to confirmed break
}

export const SCENARIOS = [
  {
    id: SCENARIO_IDS.BROKEN_CONDUCTOR,
    name: 'Broken Conductor',
    shortName: 'Line Break',
    icon: '⚡',
    severity: 'CRITICAL',
    color: 'rose',
    defaultFeederId: 'F-103',
    description:
      'Overhead wire snaps and falls. Residual current stays low — classic breaker may not trip.',
    howItWorks: [
      'Conductor mechanical failure or impact severs the line',
      'Voltage collapses on the open section; phase continuity fails',
      'Residual / earth-leakage current remains below overcurrent trip',
      'Rule engine matches conductor-loss signature and verifies persistence',
      'System requests remote isolation via certified switching gateway',
    ],
    resolution: RESOLUTION.AUTO_ISOLATE,
    resolutionLabel: 'Remote isolation + crew dispatch',
    needsIsolation: true,
    needsDispatch: true,
    visual: 'broken_wire', // LineAnimation mode
    alertTitle: 'POSSIBLE LT LINE BREAK',
    classifyLabel: 'LINE_BREAK',
    statusOnConfirm: 'LINE_BREAK',
    voice: {
      start:
        'Starting broken conductor simulation. This is the primary public-safety case: a snapped LT wire with low residual current.',
      anomaly:
        'Warning. Voltage collapse and phase imbalance on the selected feeder. Continuity open. Possible broken conductor.',
      verifying:
        'Verification window active. Confirming conductor-loss pattern is not a brief flicker before isolation.',
      confirmed:
        'Critical. Line break confirmed. Residual current may not trip a conventional breaker. High priority alert. Isolation recommended.',
      resolve:
        'Isolation complete. Supply off. Hazard de-energized. Dispatch field crew for repair.',
    },
    reading: (rng = Math.random) => ({
      voltage: +(35 + rng() * 30).toFixed(1),
      current: +(0.2 + rng() * 2).toFixed(1),
      power: +(0.04 + rng() * 0.25).toFixed(2),
      frequency: +(48.4 + rng() * 1.3).toFixed(2),
      phase: 'A—C',
      continuity: false,
    }),
    rules: [
      'V << nominal (collapse)',
      'I residual low (no overcurrent trip)',
      'Phase incomplete',
      'Continuity OPEN',
      'Persists ≥ verify window',
    ],
  },
  {
    id: SCENARIO_IDS.FALLEN_LIVE,
    name: 'Fallen Live Wire',
    shortName: 'Earth Contact',
    icon: '🔴',
    severity: 'CRITICAL',
    color: 'rose',
    defaultFeederId: 'F-105',
    description:
      'Energized conductor on ground — high public hazard even without classic short-circuit current.',
    howItWorks: [
      'Broken or detached conductor contacts soil / wet surface',
      'Irregular earth-fault signature; voltage unstable',
      'Current may be moderate leakage, not full short-circuit',
      'Classified as fallen live conductor — highest priority',
      'Immediate isolation request and public-safety alert',
    ],
    resolution: RESOLUTION.AUTO_ISOLATE,
    resolutionLabel: 'Emergency isolation + public safety alert',
    needsIsolation: true,
    needsDispatch: true,
    visual: 'fallen_live',
    alertTitle: 'FALLEN LIVE CONDUCTOR',
    classifyLabel: 'FALLEN_LIVE',
    statusOnConfirm: 'LINE_BREAK',
    voice: {
      start:
        'Starting fallen live wire simulation. Energized conductor in contact with ground — extreme public hazard.',
      anomaly:
        'Danger. Unstable earth-contact pattern detected near school zone feeder. Conductor may be on the ground and still live.',
      verifying:
        'Verifying earth-contact signature. Holding briefly to avoid false trip, then priority isolation.',
      confirmed:
        'Critical public safety alert. Fallen live conductor confirmed. Isolate immediately. Keep public clear of the area.',
      resolve:
        'Emergency isolation complete. Area safe for approach by trained crew only. Dispatch rescue and repair team.',
    },
    reading: (rng = Math.random) => ({
      voltage: +(20 + rng() * 45).toFixed(1),
      current: +(1.5 + rng() * 6).toFixed(1),
      power: +(0.1 + rng() * 0.8).toFixed(2),
      frequency: +(47.8 + rng() * 2).toFixed(2),
      phase: 'A-G',
      continuity: false,
    }),
    rules: [
      'Unstable V with earth path',
      'Leakage I elevated but not SC',
      'Phase-to-ground pattern',
      'Continuity OPEN',
      'Public hazard flag = HIGH',
    ],
  },
  {
    id: SCENARIO_IDS.PHASE_OPEN,
    name: 'Single Phase Open',
    shortName: 'Phase Loss',
    icon: '△',
    severity: 'WARNING',
    color: 'amber',
    defaultFeederId: 'F-104',
    description:
      'One phase opens (blown jumper / loose clamp). Loads see imbalance; may not look like a full break.',
    howItWorks: [
      'One phase conductor opens while others remain intact',
      'Phase signature incomplete (e.g. AB only)',
      'Voltage/current imbalance on affected phase',
      'Classified as phase-open — isolate or sectionalize depending on policy',
      'Crew repairs jumper / clamp and restores three-phase supply',
    ],
    resolution: RESOLUTION.AUTO_ISOLATE,
    resolutionLabel: 'Sectional isolation + phase repair',
    needsIsolation: true,
    needsDispatch: true,
    visual: 'phase_open',
    alertTitle: 'SINGLE PHASE OPEN',
    classifyLabel: 'PHASE_OPEN',
    statusOnConfirm: 'WARNING',
    voice: {
      start:
        'Starting single phase open simulation. One phase lost while others may still be energized.',
      anomaly:
        'Warning. Phase imbalance on industrial feeder. Phase C missing from status signature.',
      verifying:
        'Checking whether phase loss is sustained jumper failure versus momentary drop.',
      confirmed:
        'Phase open confirmed. Unbalanced supply can damage motors. Isolation and repair recommended.',
      resolve:
        'Feeder isolated for safe repair. Crew will restore phase jumper then re-energize.',
    },
    reading: (rng = Math.random) => ({
      voltage: +(150 + rng() * 40).toFixed(1),
      current: +(18 + rng() * 12).toFixed(1),
      power: +(3 + rng() * 2).toFixed(2),
      frequency: +(49.7 + rng() * 0.4).toFixed(2),
      phase: 'AB—',
      continuity: false,
    }),
    rules: [
      'One phase missing',
      'Imbalanced V / I',
      'Not full blackout',
      'Continuity partial OPEN',
      'Motor load risk flag',
    ],
  },
  {
    id: SCENARIO_IDS.INTERMITTENT,
    name: 'Intermittent Conductor',
    shortName: 'Intermittent',
    icon: '〰️',
    severity: 'WARNING',
    color: 'amber',
    defaultFeederId: 'F-102',
    description:
      'Loose clamp / arcing joint. Readings flicker between normal and fault, then escalate to full break.',
    howItWorks: [
      'Loose hardware causes arcing and intermittent open',
      'Sensors see alternating normal / abnormal samples',
      'Engine tracks flicker rate; does not isolate on first blip',
      'If pattern escalates, reclassify as line break and isolate',
      'Shows value of verification + trend, not single sample',
    ],
    resolution: RESOLUTION.ESCALATE,
    resolutionLabel: 'Escalate → isolate after sustained pattern',
    needsIsolation: true,
    needsDispatch: true,
    visual: 'intermittent',
    alertTitle: 'INTERMITTENT FAULT → LINE BREAK',
    classifyLabel: 'INTERMITTENT→BREAK',
    statusOnConfirm: 'LINE_BREAK',
    voice: {
      start:
        'Starting intermittent conductor simulation. Loose clamp will flicker, then escalate to a sustained break.',
      anomaly:
        'Caution. Flickering voltage and continuity on market road feeder. Possible arcing joint.',
      verifying:
        'Tracking intermittent pattern. Counting abnormal samples before escalation.',
      confirmed:
        'Pattern escalated. Sustained conductor failure confirmed. Isolating feeder now.',
      resolve:
        'Isolation complete after escalation. Crew will tighten or replace the clamp and conductor.',
    },
    reading: (rng = Math.random, tick = 0) => {
      // alternate healthy-ish vs broken for first half of anomaly
      const bad = tick % 2 === 0
      if (!bad) {
        return {
          voltage: +(210 + rng() * 20).toFixed(1),
          current: +(25 + rng() * 15).toFixed(1),
          power: +(5 + rng() * 3).toFixed(2),
          frequency: +(49.9 + rng() * 0.15).toFixed(2),
          phase: 'ABC',
          continuity: true,
        }
      }
      return {
        voltage: +(50 + rng() * 40).toFixed(1),
        current: +(0.5 + rng() * 3).toFixed(1),
        power: +(0.1 + rng() * 0.4).toFixed(2),
        frequency: +(48.5 + rng() * 1).toFixed(2),
        phase: 'A—C',
        continuity: false,
      }
    },
    rules: [
      'Flicker between NORMAL and FAULT',
      'Arc / clamp signature',
      'Count abnormal samples',
      'Escalate if sustained',
      'Then same as line break',
    ],
  },
  {
    id: SCENARIO_IDS.TRANSIENT,
    name: 'Transient Dip',
    shortName: 'Transient',
    icon: '⏱️',
    severity: 'WARNING',
    color: 'amber',
    defaultFeederId: 'F-101',
    description:
      'Short-lived voltage dip (switching / lightning). Looks alarming for a moment, then self-clears — no isolation.',
    howItWorks: [
      'External transient causes brief voltage/current anomaly',
      'Detection engine starts verification window',
      'Condition clears before hold time expires',
      'Classified as transient — alert logged, no isolation',
      'Avoids nuisance trips while keeping history for analysis',
    ],
    resolution: RESOLUTION.AUTO_CLEAR,
    resolutionLabel: 'Auto-clear — log only (no isolation)',
    needsIsolation: false,
    needsDispatch: false,
    visual: 'transient',
    alertTitle: 'TRANSIENT DISTURBANCE (CLEARED)',
    classifyLabel: 'TRANSIENT',
    statusOnConfirm: 'NORMAL',
    voice: {
      start:
        'Starting transient disturbance simulation. A brief dip will appear, then clear without isolation.',
      anomaly:
        'Warning. Sudden voltage dip on north grid feeder. Starting verification hold.',
      verifying:
        'Holding for confirmation. If the pattern disappears, we treat it as a transient, not a break.',
      confirmed:
        'Condition cleared during verification. Classified as transient disturbance. No isolation required.',
      resolve:
        'Feeder back to normal. Event stored for analytics. System continues monitoring.',
    },
    reading: (rng = Math.random) => ({
      voltage: +(160 + rng() * 40).toFixed(1),
      current: +(20 + rng() * 15).toFixed(1),
      power: +(4 + rng() * 3).toFixed(2),
      frequency: +(49.5 + rng() * 0.6).toFixed(2),
      phase: 'ABC',
      continuity: true,
    }),
    rules: [
      'Brief V dip',
      'Continuity still OK',
      'Does NOT persist',
      'Clear before isolate',
      'Log event only',
    ],
  },
  {
    id: SCENARIO_IDS.SENSOR_FAULT,
    name: 'Sensor / Device Fault',
    shortName: 'Sensor Fault',
    icon: '📡',
    severity: 'WARNING',
    color: 'violet',
    defaultFeederId: 'F-106',
    description:
      'IoT unit reports garbage or stuck values. Neighbor feeders healthy — classify as sensor failure, not line break.',
    howItWorks: [
      'Device sends impossible or frozen readings',
      'Neighboring monitoring points remain normal',
      'Cross-check rules reject pure line-break classification',
      'Raise sensor-maintenance alert, keep feeder energized',
      'Technician replaces / recalibrates field unit',
    ],
    resolution: RESOLUTION.AUTO_CLEAR,
    resolutionLabel: 'Sensor ticket — feeder stays ON',
    needsIsolation: false,
    needsDispatch: true, // tech dispatch, not line crew necessarily
    visual: 'sensor_fault',
    alertTitle: 'SENSOR FAILURE SUSPECTED',
    classifyLabel: 'SENSOR_FAULT',
    statusOnConfirm: 'SENSOR_FAULT',
    voice: {
      start:
        'Starting sensor fault simulation. Device will report bad data while the line itself is healthy.',
      anomaly:
        'Anomaly from hospital link monitoring unit. Readings look impossible. Cross-checking neighbors.',
      verifying:
        'Neighbor feeders normal. Pattern matches sensor failure, not conductor loss.',
      confirmed:
        'Classified as sensor or device fault. Feeder remains energized. Raise maintenance ticket.',
      resolve:
        'Maintenance team notified. No line isolation. Replace or recalibrate the field unit.',
    },
    reading: (rng = Math.random) => ({
      voltage: +(rng() > 0.5 ? 0 : 400 + rng() * 80).toFixed(1), // nonsense
      current: +(-1 + rng() * 0.2).toFixed(1),
      power: 999.9,
      frequency: +(40 + rng() * 20).toFixed(2),
      phase: '???',
      continuity: true, // line still ok — sensor lying
    }),
    rules: [
      'Impossible values / freeze',
      'Neighbor points NORMAL',
      'Reject line-break class',
      'Do NOT isolate line',
      'Open sensor ticket',
    ],
  },
  {
    id: SCENARIO_IDS.OUTAGE,
    name: 'Upstream Power Outage',
    shortName: 'Outage',
    icon: '🌑',
    severity: 'WARNING',
    color: 'slate',
    defaultFeederId: 'F-101',
    description:
      'Full blackout from upstream. Zero V/I on feeder — outage, not a broken fallen wire.',
    howItWorks: [
      'Upstream supply lost (grid / transformer / higher breaker)',
      'All electrical quantities go to zero cleanly',
      'No residual hazard signature of fallen live conductor',
      'Classify as power outage; monitor, do not “line-break isolate”',
      'Restore when upstream supply returns',
    ],
    resolution: RESOLUTION.MONITOR_ONLY,
    resolutionLabel: 'Monitor — wait for upstream restore',
    needsIsolation: false,
    needsDispatch: false,
    visual: 'outage',
    alertTitle: 'POWER OUTAGE DETECTED',
    classifyLabel: 'OUTAGE',
    statusOnConfirm: 'OUTAGE',
    voice: {
      start:
        'Starting upstream outage simulation. Feeder will go dark cleanly — not a broken live wire.',
      anomaly:
        'Voltage and current dropped to zero on the feeder. Checking whether this is outage or conductor break.',
      verifying:
        'Clean zero with no residual earth signature. Likely upstream supply loss.',
      confirmed:
        'Classified as power outage. No broken-conductor isolation needed. Notify control room and wait for upstream restore.',
      resolve:
        'Upstream supply restored in simulation. Feeder back to normal service.',
    },
    reading: () => ({
      voltage: 0,
      current: 0,
      power: 0,
      frequency: 0,
      phase: '—',
      continuity: true,
    }),
    rules: [
      'V = 0, I = 0 cleanly',
      'No residual earth current',
      'Not conductor-on-ground',
      'Class = OUTAGE',
      'Monitor / notify only',
    ],
  },
  {
    id: SCENARIO_IDS.HIGH_CURRENT,
    name: 'Short-Circuit (Breaker Trip)',
    shortName: 'Short Circuit',
    icon: '💥',
    severity: 'CRITICAL',
    color: 'rose',
    defaultFeederId: 'F-104',
    description:
      'High fault current — conventional breaker should trip. Shows how software works alongside protection.',
    howItWorks: [
      'Bolted fault or severe short drives current very high',
      'Local breaker / fuse operates (simulated trip)',
      'Software also detects high-current fault and logs event',
      'Demonstrates layered protection: hardware + software',
      'Crew repairs fault; reclose / restore under procedure',
    ],
    resolution: RESOLUTION.BREAKER_TRIP,
    resolutionLabel: 'Local breaker trips (software logs)',
    needsIsolation: false, // already off via breaker
    needsDispatch: true,
    visual: 'short_circuit',
    alertTitle: 'SHORT-CIRCUIT — BREAKER TRIPPED',
    classifyLabel: 'SHORT_CIRCUIT',
    statusOnConfirm: 'ISOLATED',
    voice: {
      start:
        'Starting short circuit simulation. High fault current should operate the conventional breaker.',
      anomaly:
        'Critical. Current rising rapidly on industrial feeder. Short circuit signature forming.',
      verifying:
        'Fault current above overcurrent threshold. Local protection expected to trip.',
      confirmed:
        'Breaker trip confirmed. Supply off via conventional protection. Software logged the event for the control room.',
      resolve:
        'Hardware protection operated as designed. Dispatch crew, repair fault, then restore under procedure.',
    },
    reading: (rng = Math.random, stage = 'fault') => {
      if (stage === 'tripped') {
        return {
          voltage: 0,
          current: 0,
          power: 0,
          frequency: 0,
          phase: '—',
          continuity: false,
          isolated: true,
        }
      }
      return {
        voltage: +(80 + rng() * 40).toFixed(1),
        current: +(180 + rng() * 80).toFixed(1), // high
        power: +(40 + rng() * 20).toFixed(2),
        frequency: +(48 + rng() * 1.5).toFixed(2),
        phase: 'ABC',
        continuity: true,
      }
    },
    rules: [
      'I >> overcurrent threshold',
      'Local breaker trips',
      'Software records event',
      'Alongside — not instead of',
      'Dispatch + repair + restore',
    ],
  },
]

export function getScenario(id) {
  return SCENARIOS.find((s) => s.id === id) || SCENARIOS[0]
}

export function getRandomScenarioId() {
  const i = Math.floor(Math.random() * SCENARIOS.length)
  return SCENARIOS[i].id
}

/** Shared timeline offsets (ms) — individual scenarios may skip/shorten steps */
export const TIMELINE = {
  start: 0,
  anomaly: 2000,
  verifying: 5500,
  confirmed: 10000,
  resolveAction: 14500, // isolate / clear / trip complete
  done: 17000,
}
