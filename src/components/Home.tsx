import { useCallback, useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"
import { FilterMode, Waveform } from "../types/audio"
import { waveformLabels, waveformShort, waveValue } from "../utils/waveMath"
import { Icon } from "./Icon"
import { Knob } from "./Knob"
import { Slider } from "./Slider"
import { SectionTitle } from "./SectionTitle"
import { Link } from "react-router"

export function Home() {
  const [playing, setPlaying] = useState(false)
  const [frequency, setFrequency] = useState(440)
  const [frequency2, setFrequency2] = useState(442)
  const [amplitude, setAmplitude] = useState(0.68)
  const [waveform, setWaveform] = useState<Waveform>("sine")
  const [phase, setPhase] = useState(0)
  const [beat, setBeat] = useState(2)
  const [filterMode, setFilterMode] = useState<FilterMode>("lowpass")
  const [cutoff, setCutoff] = useState(4800)
  const [resonance, setResonance] = useState(1.2)
  const [velocity, setVelocity] = useState(0)
  const [attack, setAttack] = useState(0.05)
  const [decay, setDecay] = useState(0.25)
  const [sustain, setSustain] = useState(0.72)
  const [release, setRelease] = useState(0.4)
  const [visualTime, setVisualTime] = useState(0)

  const releaseTimerRef = useRef<number | null>(null)
  const audioRef = useRef<{
    context: AudioContext
    oscillators: OscillatorNode[]
    phaseDelay: DelayNode
    filter: BiquadFilterNode
    envelopeGain: GainNode
    masterGain: GainNode
  } | null>(null)

  const observedFrequency = frequency * (343 / Math.max(100, 343 - velocity))
  const secondFrequency = frequency2 * (343 / Math.max(100, 343 - velocity))

  useEffect(() => {
    let frame = 0
    let animationId = 0
    const animate = () => {
      frame += 1
      if (frame % 4 === 0) setVisualTime((time) => time + 0.012)
      animationId = requestAnimationFrame(animate)
    }
    if (playing) animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [playing])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const now = audio.context.currentTime
    audio.oscillators[0].frequency.setTargetAtTime(observedFrequency, now, 0.025)
    audio.oscillators[1].frequency.setTargetAtTime(secondFrequency, now, 0.025)
    audio.oscillators.forEach((oscillator) => {
      oscillator.type = waveform === "custom" ? "sine" : waveform
    })
    audio.phaseDelay.delayTime.setTargetAtTime((phase / 360) / secondFrequency, now, 0.025)
    audio.filter.type = filterMode
    audio.filter.frequency.setTargetAtTime(
      Math.min(cutoff, audio.context.sampleRate / 2),
      now,
      0.02,
    )
    audio.filter.Q.setTargetAtTime(resonance, now, 0.02)
    audio.masterGain.gain.setTargetAtTime(amplitude * 0.2, now, 0.025)
  }, [amplitude, beat, cutoff, filterMode, observedFrequency, phase, resonance, secondFrequency, waveform])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const now = audio.context.currentTime
    const gain = audio.envelopeGain.gain
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(Math.max(0, gain.value), now)
    gain.linearRampToValueAtTime(1, now + attack)
    gain.linearRampToValueAtTime(sustain, now + attack + decay)
  }, [attack, decay, sustain])

  const stopAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio) {
      setPlaying(false)
      return
    }
    if (releaseTimerRef.current !== null) window.clearTimeout(releaseTimerRef.current)
    const now = audio.context.currentTime
    const env = audio.envelopeGain.gain
    env.cancelScheduledValues(now)
    env.setValueAtTime(Math.max(0, env.value), now)
    env.linearRampToValueAtTime(0, now + release)
    releaseTimerRef.current = window.setTimeout(() => {
      audio.oscillators.forEach((oscillator) => {
        try {
          oscillator.stop()
        } catch {
          /* Ya estaba detenido. */
        }
      })
      void audio.context.close()
      releaseTimerRef.current = null
    }, release * 1000 + 80)
    audioRef.current = null
    setPlaying(false)
  }, [release])

  const startAudio = async () => {
    if (releaseTimerRef.current !== null) window.clearTimeout(releaseTimerRef.current)
    releaseTimerRef.current = null

    const context = new AudioContext()
    const filter = context.createBiquadFilter()
    const envelopeGain = context.createGain()
    const masterGain = context.createGain()
    const phaseDelay = context.createDelay(0.1)
    filter.type = filterMode
    filter.frequency.value = Math.min(cutoff, context.sampleRate / 2)
    filter.Q.value = resonance
    envelopeGain.gain.value = 0
    masterGain.gain.value = amplitude * 0.2

    const first = context.createOscillator()
    const firstGain = context.createGain()
    first.type = waveform === "custom" ? "sine" : waveform
    first.frequency.value = observedFrequency
    firstGain.gain.value = 0.5
    first.connect(firstGain)
    firstGain.connect(filter)
    first.start()

    const second = context.createOscillator()
    const secondGain = context.createGain()
    second.type = waveform === "custom" ? "sine" : waveform
    second.frequency.value = secondFrequency
    secondGain.gain.value = 0.5
    phaseDelay.delayTime.value = (phase / 360) / secondFrequency
    second.connect(secondGain)
    secondGain.connect(phaseDelay)
    phaseDelay.connect(filter)
    second.start()

    filter.connect(envelopeGain)
    envelopeGain.connect(masterGain)
    masterGain.connect(context.destination)

    const now = context.currentTime
    envelopeGain.gain.setValueAtTime(0, now)
    envelopeGain.gain.linearRampToValueAtTime(1, now + attack)
    envelopeGain.gain.linearRampToValueAtTime(sustain, now + attack + decay)

    audioRef.current = {
      context,
      oscillators: [first, second],
      phaseDelay,
      filter,
      envelopeGain,
      masterGain,
    }
    await context.resume()
    setPlaying(true)
  }

  useEffect(() => () => {
    if (releaseTimerRef.current !== null) window.clearTimeout(releaseTimerRef.current)
    const audio = audioRef.current
    audio?.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop()
      } catch {
        /* Ya estaba detenido. */
      }
    })
    void audio?.context.close()
  }, [])

  const reset = () => {
    stopAudio()
    setFrequency(440)
    setAmplitude(0.68)
    setWaveform("sine")
    setPhase(0)
    setBeat(2)
    setFilterMode("lowpass")
    setCutoff(4800)
    setResonance(1.2)
    setVelocity(0)
    setAttack(0.05)
    setDecay(0.25)
    setSustain(0.72)
    setRelease(0.4)
    setVisualTime(0)
  }

  const firstPoints = Array.from({ length: 180 }, (_, index) => {
    const x = (index / 179) * 1000
    const t = (index / 179) * 0.01
    const angle = 2 * Math.PI * observedFrequency * t + visualTime * 1.5
    const y = 145 - waveValue(waveform, angle) * amplitude * 96
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")

  const secondPoints = Array.from({ length: 180 }, (_, index) => {
    const x = (index / 179) * 1000
    const t = (index / 179) * 0.01
    const angle = 2 * Math.PI * secondFrequency * t + -(phase * Math.PI) / 180 + visualTime * 1.5
    const y = 145 - waveValue(waveform, angle) * amplitude * 96
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")

  const points = Array.from({ length: 180 }, (_, index) => {
    const x = (index / 179) * 1000
    const t = (index / 179) * 0.01
    const angle1 = 2 * Math.PI * observedFrequency * t + visualTime * 1.5
    const angle2 = 2 * Math.PI * secondFrequency * t + -(phase * Math.PI) / 180 + visualTime * 1.5
    const first = waveValue(waveform, angle1)
    const second = waveValue(waveform, angle2)
    const y = 145 - ((first + second) / 2) * amplitude * 96
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")

  const navLinkStyle = {
    fontSize: "13px",
    padding: "6px 12px",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "inherit",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="wave" size={22} />
          </span>
          <span>
            <strong>ONDULAB</strong>
            <small>Laboratorio de ondas</small>
          </span>
        </div>

        <div className="top-actions">
          <nav style={{ display: "flex", gap: "8px" }}>
            <Link to="/" title="Ir a Inicio" style={navLinkStyle}>
              Inicio
            </Link>
            <Link to="/armonicos" title="Ir a Síntesis Armónica" style={navLinkStyle}>
              Armonicos
            </Link>
            <Link to="/Ejercicios" title="Ir a Ejercicios" style={navLinkStyle}>
              Ejercicios
            </Link>
          </nav>

          <span className={`status ${playing ? "is-live" : ""}`}>
            <i /> {playing ? "SEÑAL ACTIVA" : "EN ESPERA"}
          </span>
          <button
            className="icon-button"
            onClick={reset}
            title="Restablecer valores"
            aria-label="Restablecer valores"
          >
            <Icon name="reset" />
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="side-intro">
            <span>PARÁMETROS DE SEÑAL</span>
            <p>Modifica la onda y observa su comportamiento en tiempo real.</p>
          </div>

          <section className="control-section flex flex-col gap-4">
            <SectionTitle
              index="01"
              title="Oscilador"
              caption="Propiedades de la onda"
            />

            <div className="flex flex-col gap-3">
              <Slider
                label="FRECUENCIA"
                value={frequency}
                min={20}
                max={2000}
                step={1}
                unit="Hz"
                onChange={setFrequency}
              />
              <Slider
                label="AMPLITUD"
                value={amplitude}
                min={0}
                max={1}
                step={0.01}
                unit=""
                onChange={setAmplitude}
              />
              <Slider
                label="DESFASE"
                value={phase}
                min={0}
                max={Math.PI * 2}
                step={0.01}
                unit="rad"
                onChange={setPhase}
              />
              <Slider
                label="FRECUENCIA 2"
                value={frequency2}
                min={20}
                max={2000}
                step={1}
                unit="Hz"
                onChange={setFrequency2}
              />
            </div>

            <div className="field-label">NOTAS MUSICALES · DO MAYOR</div>
            <div className="wave-options note-options">
              {[
                ["Do", 261.63],
                ["Re", 293.66],
                ["Mi", 329.63],
                ["Fa", 349.23],
                ["Sol", 392],
                ["La", 440],
                ["Si", 493.88],
                ["Do⁵", 523.25],
              ].map(([note, hz]) => (
                <button
                  key={String(note)}
                  className={Math.abs(frequency - Number(hz)) < 0.5 ? "active" : ""}
                  onClick={() => setFrequency(Number(hz))}
                  title={`${note}: ${Number(hz).toFixed(2)} Hz`}
                >
                  <small>{note}</small>
                </button>
              ))}
            </div>
            <div className="field-label">FORMA DE ONDA</div>
            <div className="wave-options">
              {(["sine", "triangle", "square", "sawtooth"] as Waveform[]).map((type) => (
                <button
                  key={type}
                  className={waveform === type ? "active" : ""}
                  onClick={() => setWaveform(type)}
                  aria-label={waveformLabels[type]}
                  title={waveformLabels[type]}
                >
                  <svg viewBox="0 0 48 18" aria-hidden="true">
                    {type === "sine" && <path d="M1 9c6-11 12-11 18 0s12 11 18 0 8-8 10-4" />}
                    {type === "triangle" && <path d="m1 14 11-10 12 10L36 4l11 10" />}
                    {type === "square" && <path d="M1 14V4h12v10h12V4h12v10h10" />}
                    {type === "sawtooth" && <path d="M1 14 14 4v10L27 4v10L40 4v10h7" />}
                  </svg>
                  <small>{waveformShort[type]}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="control-section">
            <SectionTitle
              index="02"
              title="Interferencia"
              caption="Batido entre dos frecuencias"
            />
            <Slider
              label="FRECUENCIA DE BATIDO"
              value={beat}
              min={0}
              max={20}
              step={0.1}
              unit="Hz"
              onChange={setBeat}
            />
            <div className="formula">
              <span>f₁</span>
              <strong>{frequency.toFixed(1)} Hz</strong>
              <span>f₂</span>
              <strong>{secondFrequency.toFixed(1)} Hz</strong>
              <span>Δf</span>
              <strong className="accent-text">{beat.toFixed(1)} Hz</strong>
            </div>
          </section>

          <section className="control-section">
            <SectionTitle
              index="03"
              title="Filtro"
              caption="Moldea el espectro"
            />
            <div className="toggle">
              <button
                className={filterMode === "lowpass" ? "active" : ""}
                onClick={() => setFilterMode("lowpass")}
              >
                Pasa bajos
              </button>
              <button
                className={filterMode === "highpass" ? "active" : ""}
                onClick={() => setFilterMode("highpass")}
              >
                Pasa altos
              </button>
            </div>
            <p className="filter-help">
              {filterMode === "lowpass"
                ? "Pasa bajos: atenúa las frecuencias por encima del corte."
                : "Pasa altos: atenúa las frecuencias por debajo del corte."}{" "}
              La resonancia (Q) enfatiza las frecuencias cercanas al corte.
            </p>
            <Slider
              label="FRECUENCIA DE CORTE"
              value={cutoff}
              min={100}
              max={12000}
              step={10}
              unit="Hz"
              onChange={setCutoff}
            />
            <Slider
              label="RESONANCIA (Q)"
              value={resonance}
              min={0.1}
              max={20}
              step={0.1}
              unit=""
              onChange={setResonance}
            />
          </section>
        </aside>

        <div className="main-panel">
          <section className="scope-card">
            <div className="scope-header">
              <div>
                <span className="eyebrow">OSCILOSCOPIO · DOMINIO TEMPORAL</span>
                <strong>Señal resultante</strong>
              </div>
              <div className="readouts">
                <span>
                  <small>FRECUENCIA</small>
                  <strong>
                    {observedFrequency.toFixed(1)} <i>Hz</i>
                  </strong>
                </span>
                <span>
                  <small>PERIODO</small>
                  <strong>
                    {(1000 / observedFrequency).toFixed(2)} <i>ms</i>
                  </strong>
                </span>
                <span>
                  <small>AMPLITUD</small>
                  <strong>
                    {amplitude.toFixed(2)} <i>V</i>
                  </strong>
                </span>
              </div>
            </div>
            <div className="scope">
              <span className="scope-badge">
                <i /> CANAL A
              </span>
              <span className="axis-label top">+1.0</span>
              <span className="axis-label middle">0.0</span>
              <span className="axis-label bottom">−1.0</span>
              <svg
                viewBox="0 0 1000 290"
                preserveAspectRatio="none"
                role="img"
                aria-label="Visualización de la onda resultante"
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="waveGradient" x1="0" x2="1">
                    <stop offset="0" stopColor="#44e9ff" />
                    <stop offset="0.52" stopColor="#b97cff" />
                    <stop offset="1" stopColor="#44e9ff" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="145" x2="1000" y2="145" className="zero-line" />
                <polyline
                  points={firstPoints}
                  fill="none"
                  stroke="#44e9ff"
                  strokeWidth="2"
                  opacity="0.75"
                />
                <polyline
                  points={secondPoints}
                  fill="none"
                  stroke="#b97cff"
                  strokeWidth="2"
                  opacity="0.75"
                />
                <polyline points={points} className="wave-glow" />
                <polyline points={points} className="wave-line" />
              </svg>
              <div className="wave-legend">
                <span>
                  <i style={{ background: "#44e9ff" }} /> Onda 1 · {observedFrequency.toFixed(1)} Hz
                </span>
                <span>
                  <i style={{ background: "#b97cff" }} /> Onda 2 · {secondFrequency.toFixed(1)} Hz
                  · desfase {phase.toFixed(2)} rad
                </span>
                <span>
                  <i style={{ background: "#e8f4ff" }} /> Resultante
                </span>
              </div>
              <div className="time-scale">
                <span>0 ms</span>
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10 ms</span>
              </div>
            </div>
          </section>

          <div className="lower-grid">
            <section className="module-card doppler-card">
              <SectionTitle
                index="04"
                title="Efecto Doppler"
                caption="Fuente móvil · velocidad del sonido 343 m/s"
              />
              <div className="doppler-visual">
                <div className="wave-rings left">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="source">
                  <Icon name="speaker" size={21} />
                </div>
                <div className="wave-rings right">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="observer">
                  <Icon name="activity" size={18} />
                  <small>OBSERVADOR</small>
                </div>
                <span
                  className="motion-line"
                  style={
                    {
                      "--speed": `${Math.abs(velocity) / 1.2}%`,
                    } as CSSProperties
                  }
                />
              </div>
              <Slider
                label="VELOCIDAD DE LA FUENTE"
                value={velocity}
                min={-120}
                max={120}
                step={1}
                unit="m/s"
                onChange={setVelocity}
              />
              <div className="doppler-stats">
                <span>
                  <small>EMITIDA</small>
                  <strong>{frequency.toFixed(1)} Hz</strong>
                </span>
                <span className="arrow">→</span>
                <span>
                  <small>OBSERVADA</small>
                  <strong>{observedFrequency.toFixed(1)} Hz</strong>
                </span>
                <span className={`shift ${velocity >= 0 ? "positive" : ""}`}>
                  {velocity >= 0 ? "+" : ""}
                  {(observedFrequency - frequency).toFixed(1)} Hz
                </span>
              </div>
            </section>

            
          </div>
        </div>
      </div>

      <footer className="transport">
        <div className="transport-note">
          <Icon name="activity" size={16} />
          <span>
            <strong>Consejo</strong> Usa auriculares y un volumen moderado.
          </span>
        </div>
        <button
          className={`play-button ${playing ? "playing" : ""}`}
          onClick={playing ? stopAudio : startAudio}
        >
          <span>
            <Icon name={playing ? "pause" : "play"} size={20} />
          </span>
          {playing ? "DETENER SONIDO" : "REPRODUCIR SONIDO"}
        </button>
        <div className="master-level">
          <span>
            <i style={{ width: `${amplitude * 100}%` }} />
          </span>
          <small>NIVEL MAESTRO</small>
        </div>
      </footer>
    </main>
  )
}