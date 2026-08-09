import { useState } from 'react'
import { useSimulation } from './hooks/useSimulation'
import Header from './components/Header'
import LineAnimation from './components/LineAnimation'
import MetricsChart from './components/MetricsChart'
import FeederMap from './components/FeederMap'
import ArchitectureBanner from './components/ArchitectureBanner'
import ComparisonTable from './components/ComparisonTable'
import VoiceBanner from './components/VoiceBanner'
import ScenarioSidebar from './components/ScenarioSidebar'
import RightDock from './components/RightDock'
import FeederList from './components/FeederList'

export default function App() {
  const sim = useSimulation()
  const [tab, setTab] = useState('ops')

  const controlProps = {
    alerts: sim.alerts,
    phase: sim.phase,
    scenario: sim.activeScenario,
    resolutionNote: sim.resolutionNote,
    verifyProgress: sim.verifyProgress,
    detectionLog: sim.detectionLog,
    incidentStages: sim.incidentStages,
    incidentStage: sim.incidentStage,
    events: sim.events,
    onAcknowledge: sim.acknowledgeAlert,
    onDispatch: sim.dispatchTeam,
    onIsolate: sim.isolateManually,
    onRepair: sim.completeRepair,
  }

  return (
    <div className="app-bg flex h-dvh max-h-dvh flex-col overflow-hidden">
      <Header
        clock={sim.clock}
        isDemoRunning={sim.isDemoRunning}
        onRunDemo={sim.runLineBreakDemo}
        onRandom={sim.runRandomScenario}
        onReset={sim.resetDemo}
        soundOn={sim.soundOn}
        voiceOn={sim.voiceOn}
        speechOk={sim.speechOk}
        onToggleSound={sim.toggleSound}
        onToggleVoice={sim.toggleVoice}
        scenarioName={sim.selectedScenario?.shortName}
        tab={tab}
        onTab={setTab}
      />

      <VoiceBanner
        text={sim.voiceSubtitle}
        voiceOn={sim.voiceOn}
        onDismiss={sim.clearVoiceSubtitle}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── OPS: simulation focus (no telemetry/feeders split) ── */}
        {tab === 'ops' && (
          <>
            <div className="hidden h-full min-h-0 sm:flex">
              <ScenarioSidebar
                scenarios={sim.scenarios}
                scenarioId={sim.scenarioId}
                selectedScenario={sim.selectedScenario}
                isDemoRunning={sim.isDemoRunning}
                onSelect={sim.selectScenario}
                onRun={sim.runLineBreakDemo}
                onRandom={sim.runRandomScenario}
                counts={sim.counts}
              />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden p-2">
              <div className="flex shrink-0 gap-1 overflow-x-auto pb-0.5 sm:hidden">
                {sim.scenarios.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={sim.isDemoRunning}
                    onClick={() => sim.selectScenario(s.id)}
                    className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-medium ${
                      sim.scenarioId === s.id
                        ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    {s.icon} {s.shortName}
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1">
                <LineAnimation
                  phase={sim.phase}
                  feeder={sim.targetFeeder}
                  scenario={sim.activeScenario}
                  compact
                />
              </div>
            </div>

            <div className="hidden h-full min-h-0 lg:flex">
              <RightDock {...controlProps} />
            </div>
          </>
        )}

        {/* ── MAP: split screen — map left | telemetry + feeders half/half right ── */}
        {tab === 'analytics' && (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden p-2 md:grid-cols-2">
            <div className="min-h-0 overflow-hidden">
              <FeederMap
                feeders={sim.feeders}
                selectedId={sim.selectedId}
                onSelect={sim.setSelectedId}
              />
            </div>
            <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
              <div className="min-h-0 flex-1 basis-0">
                <MetricsChart
                  history={sim.history}
                  feederId={sim.selectedId}
                  feeder={sim.selected}
                />
              </div>
              <div className="min-h-0 flex-1 basis-0">
                <FeederList
                  feeders={sim.feeders}
                  selectedId={sim.selectedId}
                  onSelect={sim.setSelectedId}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'about' && (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
            <ArchitectureBanner />
            <ComparisonTable />
            <div className="panel p-4">
              <p className="panel-header mb-2">Pitch</p>
              <blockquote className="border-l-2 border-cyan-500/50 pl-3 text-sm italic text-slate-300">
                Software-based intelligent detection and remote isolation layer that works
                alongside existing electrical protection equipment.
              </blockquote>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {sim.scenarios.map((s) => (
                <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-2.5">
                  <p className="text-xs font-semibold text-slate-100">
                    {s.icon} {s.shortName}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Ops: control dock only */}
      {tab === 'ops' && (
        <div className="max-h-[34vh] shrink-0 overflow-y-auto border-t border-slate-800 lg:hidden">
          <RightDock {...controlProps} />
        </div>
      )}
    </div>
  )
}
