/** Seed data for the LT Line Monitoring demo (software simulation only) */

export const INITIAL_FEEDERS = [
  {
    id: 'F-101',
    name: 'Feeder 01',
    zone: 'Ward 3 — North Grid',
    pole: 'P-12',
    lat: 28.6139,
    lng: 77.209,
    status: 'NORMAL',
    voltage: 230.4,
    current: 42.1,
    power: 9.68,
    frequency: 50.02,
    phase: 'ABC',
    continuity: true,
    isolated: false,
  },
  {
    id: 'F-102',
    name: 'Feeder 02',
    zone: 'Ward 5 — Market Road',
    pole: 'P-27',
    lat: 28.621,
    lng: 77.218,
    status: 'NORMAL',
    voltage: 228.7,
    current: 38.5,
    power: 8.81,
    frequency: 49.98,
    phase: 'ABC',
    continuity: true,
    isolated: false,
  },
  {
    id: 'F-103',
    name: 'Feeder 03',
    zone: 'Ward 7 — Residential',
    pole: 'P-41',
    lat: 28.605,
    lng: 77.195,
    status: 'NORMAL',
    voltage: 231.1,
    current: 45.2,
    power: 10.44,
    frequency: 50.01,
    phase: 'ABC',
    continuity: true,
    isolated: false,
  },
  {
    id: 'F-104',
    name: 'Feeder 04',
    zone: 'Ward 2 — Industrial',
    pole: 'P-08',
    lat: 28.628,
    lng: 77.201,
    status: 'NORMAL',
    voltage: 229.5,
    current: 51.8,
    power: 11.89,
    frequency: 50.0,
    phase: 'ABC',
    continuity: true,
    isolated: false,
  },
  {
    id: 'F-105',
    name: 'Feeder 05',
    zone: 'Ward 9 — School Zone',
    pole: 'P-55',
    lat: 28.598,
    lng: 77.225,
    status: 'NORMAL',
    voltage: 230.0,
    current: 36.4,
    power: 8.37,
    frequency: 50.03,
    phase: 'ABC',
    continuity: true,
    isolated: false,
  },
  {
    id: 'F-106',
    name: 'Feeder 06',
    zone: 'Ward 4 — Hospital Link',
    pole: 'P-33',
    lat: 28.618,
    lng: 77.232,
    status: 'NORMAL',
    voltage: 232.2,
    current: 40.0,
    power: 9.29,
    frequency: 49.99,
    phase: 'ABC',
    continuity: true,
    isolated: false,
  },
]

export const DETECTION_STEPS = [
  { id: 'sense', label: 'Sensor capture', desc: 'Voltage, current, frequency, phase' },
  { id: 'stream', label: 'Edge → API', desc: 'IoT readings posted to backend' },
  { id: 'analyze', label: 'Rule engine', desc: 'Pattern match vs. conductor-loss rules' },
  { id: 'verify', label: 'Verification window', desc: 'Condition must persist (safety hold)' },
  { id: 'classify', label: 'Classify fault', desc: 'Possible broken conductor' },
  { id: 'isolate', label: 'Isolation request', desc: 'Command to remote switching gateway' },
  { id: 'alert', label: 'Control room alert', desc: 'Dashboard + dispatch notification' },
]

export const INCIDENT_STAGES = [
  'Detected',
  'Verified',
  'Isolation Requested',
  'Isolated',
  'Team Dispatched',
  'Repair Completed',
  'System Restored',
]

export function randomNormalReading(base) {
  const jitter = (n, pct = 0.012) => n * (1 + (Math.random() - 0.5) * 2 * pct)
  return {
    voltage: +jitter(base.voltage || 230).toFixed(1),
    current: +jitter(base.current || 40, 0.03).toFixed(1),
    power: +jitter(base.power || 9, 0.03).toFixed(2),
    frequency: +(50 + (Math.random() - 0.5) * 0.08).toFixed(2),
  }
}

/** Simulated line-break electrical signature (not high enough for classic overcurrent trip) */
export function lineBreakReading() {
  return {
    voltage: +(40 + Math.random() * 25).toFixed(1), // collapsed / unstable residual
    current: +(0.3 + Math.random() * 1.8).toFixed(1), // low residual / earth leakage-like
    power: +(0.05 + Math.random() * 0.2).toFixed(2),
    frequency: +(48.5 + Math.random() * 1.2).toFixed(2),
    phase: 'A—C', // missing phase
    continuity: false,
  }
}
