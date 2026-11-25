import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { FilterMode, Waveform } from "./types/audio";
import { waveformLabels, waveformShort, waveValue } from "./utils/waveMath";
import { Icon } from "./components/Icon";
import { Knob } from "./components/Knob";
import { Slider } from "./components/Slider";
import { SectionTitle } from "./components/SectionTitle";
import { HarmonicsPage } from "./components/HarmonicsPage";
import { Link } from "react-router";
import { WaveMathLab } from "./components/WaveMathLab";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
export default function App() {
  const [playing, setPlaying] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [frequency2, setFrequency2] = useState(442);
  const [amplitude2, setAmplitude2] = useState(0.68);
  const [amplitude, setAmplitude] = useState(0.68);
  const [waveform, setWaveform] = useState<Waveform>("sine");
  const [phase, setPhase] = useState(0);
  const [beat, setBeat] = useState(2);
  const [filterMode, setFilterMode] = useState<FilterMode>("lowpass");
  const [cutoff, setCutoff] = useState(4800);
  const [resonance, setResonance] = useState(1.2);
  const [velocity, setVelocity] = useState(0);
  const [attack, setAttack] = useState(0.05);
  const [decay, setDecay] = useState(0.25);
  const [sustain, setSustain] = useState(0.72);
  const [release, setRelease] = useState(0.4);
  const [visualTime, setVisualTime] = useState(0);
  const speedRatio = Math.min(Math.abs(velocity) / 120, 1); // 0 a 1
  const directionClass =
    velocity > 0 ? "is-right" : velocity < 0 ? "is-left" : "is-idle";
  const releaseTimerRef = useRef<number | null>(null);
  const audioRef = useRef<{
    context: AudioContext;
    oscillators: OscillatorNode[];
    oscillatorGains: GainNode[];
    phaseDelay: DelayNode;
    filter: BiquadFilterNode;
    envelopeGain: GainNode;
    masterGain: GainNode;
  } | null>(null);

  const observedFrequency = frequency * (343 / Math.max(100, 343 - velocity));
  const secondFrequency = frequency2 * (343 / Math.max(100, 343 - velocity));
  const [timeMs, setTimeMs] = useState(0);
  const tSec = timeMs / 1000;
  // El audio sigue a tiempo real; solo ralentizamos el desplazamiento visual.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const now = audio.context.currentTime;

    // Frecuencias individuales
    audio.oscillators[0].frequency.setTargetAtTime(
      observedFrequency,
      now,
      0.025,
    );

    audio.oscillators[1].frequency.setTargetAtTime(secondFrequency, now, 0.025);

    // Forma de onda
    audio.oscillators.forEach((oscillator) => {
      oscillator.type = waveform === "custom" ? "sine" : waveform;
    });

    // Amplitudes independientes
    audio.oscillatorGains[0].gain.setTargetAtTime(amplitude * 0.2, now, 0.025);

    audio.oscillatorGains[1].gain.setTargetAtTime(amplitude2 * 0.2, now, 0.025);

    // Desfase de la segunda onda
    audio.phaseDelay.delayTime.setTargetAtTime(
      phase / 360 / secondFrequency,
      now,
      0.025,
    );

    // Filtro
    audio.filter.type = filterMode;

    audio.filter.frequency.setTargetAtTime(
      Math.min(cutoff, audio.context.sampleRate / 2),
      now,
      0.02,
    );

    audio.filter.Q.setTargetAtTime(resonance, now, 0.02);
  }, [
    amplitude,
    amplitude2,
    frequency,
    frequency2,
    observedFrequency,
    secondFrequency,
    phase,
    waveform,
    filterMode,
    cutoff,
    resonance,
  ]);

  // Estos cambios sí se aplican al audio que ya está reproduciéndose.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const now = audio.context.currentTime;
    audio.oscillators[0].frequency.setTargetAtTime(
      observedFrequency,
      now,
      0.025,
    );
    audio.oscillators[1].frequency.setTargetAtTime(secondFrequency, now, 0.025);
    audio.oscillators.forEach((oscillator) => {
      oscillator.type = waveform === "custom" ? "sine" : waveform;
    });
    // El desfase se consigue retrasando la segunda onda una fracción de su periodo.
    audio.phaseDelay.delayTime.setTargetAtTime(
      phase / 360 / secondFrequency,
      now,
      0.025,
    );
    audio.filter.type = filterMode;
    audio.filter.frequency.setTargetAtTime(
      Math.min(cutoff, audio.context.sampleRate / 2),
      now,
      0.02,
    );
    audio.filter.Q.setTargetAtTime(resonance, now, 0.02);
    audio.masterGain.gain.setTargetAtTime(amplitude * 0.2, now, 0.025);
  }, [
    amplitude,
    beat,
    cutoff,
    filterMode,
    observedFrequency,
    phase,
    resonance,
    secondFrequency,
    waveform,
  ]);

  // Al mover ataque, decaimiento o sostenimiento, la envolvente se actualiza en vivo.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const now = audio.context.currentTime;
    const gain = audio.envelopeGain.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(Math.max(0, gain.value), now);
    gain.linearRampToValueAtTime(1, now + attack);
    gain.linearRampToValueAtTime(sustain, now + attack + decay);
  }, [attack, decay, sustain]);

  const stopAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      setPlaying(false);
      return;
    }
    if (releaseTimerRef.current !== null)
      window.clearTimeout(releaseTimerRef.current);
    const now = audio.context.currentTime;
    const env = audio.envelopeGain.gain;
    env.cancelScheduledValues(now);
    env.setValueAtTime(Math.max(0, env.value), now);
    env.linearRampToValueAtTime(0, now + release);
    releaseTimerRef.current = window.setTimeout(
      () => {
        audio.oscillators.forEach((oscillator) => {
          try {
            oscillator.stop();
          } catch {
            /* Ya estaba detenido. */
          }
        });
        void audio.context.close();
        releaseTimerRef.current = null;
      },
      release * 1000 + 80,
    );
    audioRef.current = null;
    setPlaying(false);
  }, [release]);

  const startAudio = async () => {
    if (releaseTimerRef.current !== null) {
      window.clearTimeout(releaseTimerRef.current);
    }

    releaseTimerRef.current = null;

    const context = new AudioContext();

    const filter = context.createBiquadFilter();
    const envelopeGain = context.createGain();
    const masterGain = context.createGain();
    const phaseDelay = context.createDelay(0.1);

    filter.type = filterMode;

    filter.frequency.value = Math.min(cutoff, context.sampleRate / 2);

    filter.Q.value = resonance;

    envelopeGain.gain.value = 0;
    masterGain.gain.value = 1;

    // OSCILADOR 1
    const first = context.createOscillator();
    const firstGain = context.createGain();

    first.type = waveform === "custom" ? "sine" : waveform;
    first.frequency.value = observedFrequency;

    firstGain.gain.value = amplitude * 0.2;

    first.connect(firstGain);
    firstGain.connect(filter);

    first.start();

    // OSCILADOR 2
    const second = context.createOscillator();
    const secondGain = context.createGain();

    second.type = waveform === "custom" ? "sine" : waveform;
    second.frequency.value = secondFrequency;

    secondGain.gain.value = amplitude2 * 0.2;

    phaseDelay.delayTime.value = phase / 360 / secondFrequency;

    second.connect(secondGain);
    secondGain.connect(phaseDelay);
    phaseDelay.connect(filter);

    second.start();

    // SALIDA DE AUDIO
    filter.connect(envelopeGain);
    envelopeGain.connect(masterGain);
    masterGain.connect(context.destination);

    // ENVOLVENTE
    const now = context.currentTime;

    envelopeGain.gain.setValueAtTime(0, now);

    envelopeGain.gain.linearRampToValueAtTime(1, now + attack);

    envelopeGain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    audioRef.current = {
      context,
      oscillators: [first, second],
      oscillatorGains: [firstGain, secondGain],
      phaseDelay,
      filter,
      envelopeGain,
      masterGain,
    };

    await context.resume();

    setPlaying(true);
  };

  useEffect(
    () => () => {
      if (releaseTimerRef.current !== null)
        window.clearTimeout(releaseTimerRef.current);
      const audio = audioRef.current;
      audio?.oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          /* Ya estaba detenido. */
        }
      });
      void audio?.context.close();
    },
    [],
  );

  const reset = () => {
    stopAudio();
    setFrequency(440);
    setAmplitude(0.68);
    setWaveform("sine");
    setPhase(0);
    setBeat(2);
    setFilterMode("lowpass");
    setCutoff(4800);
    setResonance(1.2);
    setVelocity(0);
    setAttack(0.05);
    setDecay(0.25);
    setSustain(0.72);
    setRelease(0.4);
    setVisualTime(0);
    setFrequency2(442);
    setAmplitude2(0.68);
    setPhase(0);
  };

  // Tres trazas en la misma escala: onda 1, onda 2 y suma resultante.
  // Escala visual compartida
  const visualScale = 65;
  const centerY = 145;

  // Onda 1
  const firstPoints = Array.from({ length: 180 }, (_, index) => {
    const x = (index / 179) * 1000;
    const t = (index / 179) * 0.01;

    const angle = 2 * Math.PI * observedFrequency * t + visualTime * 1.5;

    const value = waveValue(waveform, angle);

    const y = centerY - value * amplitude * visualScale;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  // Onda 2
  const secondPoints = Array.from({ length: 180 }, (_, index) => {
    const x = (index / 179) * 1000;
    const t = (index / 179) * 0.01;

    const angle =
      2 * Math.PI * secondFrequency * t -
      (phase * Math.PI) / 180 +
      visualTime * 1.5;

    const value = waveValue(waveform, angle);

    const y = centerY - value * amplitude2 * visualScale;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const phaseRad = (phase * Math.PI) / 180;

  const y1AtT = amplitude * Math.sin(2 * Math.PI * observedFrequency * tSec);
  const y2AtT =
    amplitude2 * Math.sin(2 * Math.PI * secondFrequency * tSec - phaseRad);
  const resultantAtT = y1AtT + y2AtT;

  // 0 ms -> 0, 10 ms -> 1000
  const markerX = Math.min(Math.max((timeMs / 10) * 1000, 0), 1000);

  // Usa el mismo factor vertical que aplicas a `points` (ej. 60px por unidad -> ±2.0 = ±120px)
  const yScale = 60;
  const markerY = Math.min(Math.max(145 - resultantAtT * yScale, 12), 278);
  // SUPERPOSICIÓN
  const points = Array.from({ length: 180 }, (_, index) => {
    const x = (index / 179) * 1000;
    const t = (index / 179) * 0.01;

    const angle1 = 2 * Math.PI * observedFrequency * t + visualTime * 1.5;

    const angle2 =
      2 * Math.PI * secondFrequency * t -
      (phase * Math.PI) / 180 +
      visualTime * 1.5;

    const wave1 = waveValue(waveform, angle1);
    const wave2 = waveValue(waveform, angle2);

    // Suma real de los desplazamientos
    const resultant = amplitude * wave1 + amplitude2 * wave2;

    const y = centerY - resultant * visualScale;

    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const isMobile = useIsMobile(768);

  const scopeSection = (
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
        <span className="axis-label top">+2.0</span>
        <span className="axis-label middle">0.0</span>
        <span className="axis-label bottom">−2.0</span>
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
          <line
            x1={markerX}
            y1={12}
            x2={markerX}
            y2={278}
            stroke="#f8fafc"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.65"
          />
          <circle
            cx={markerX}
            cy={markerY}
            r="6"
            fill="#38bdf8"
            stroke="#0f172a"
            strokeWidth="2"
          />
          <circle
            cx={markerX}
            cy={markerY}
            r="11"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            opacity="0.45"
          />
        </svg>
        <div className="wave-legend">
          <span>
            <i style={{ background: "#44e9ff" }} />
            Onda 1 · {observedFrequency.toFixed(1)} Hz
          </span>
          <span>
            <i style={{ background: "#b97cff" }} />
            Onda 2 · {secondFrequency.toFixed(1)} Hz
          </span>
          <span>
            <i style={{ background: "#e8f4ff" }} />
            Resultante · desfase {phase.toFixed(0)}°
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
  );

  const sidebarSection = (
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
            label="FRECUENCIA 2"
            value={frequency2}
            min={20}
            max={2000}
            step={1}
            unit="Hz"
            onChange={setFrequency2}
          />
          <Slider
            label="AMPLITUD 2"
            value={amplitude2}
            min={0}
            max={1}
            step={0.01}
            unit=""
            onChange={setAmplitude2}
          />
          <Slider
            label="DESFASE"
            value={phase}
            min={0}
            max={360}
            step={1}
            unit="°"
            onChange={setPhase}
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
      </section>
    </aside>
  );

  const dopplerSection = (
    <div className="lower-grid">
      <section className="module-card doppler-card">
        <SectionTitle
          index="02"
          title="Efecto Doppler"
          caption="Fuente móvil · velocidad del sonido 343 m/s"
        />
        <div className={`doppler-visual ${directionClass}`}>
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
          <div
            className="motion-track"
            style={
              {
                "--speed-ratio": speedRatio,
                "--sign": velocity >= 0 ? 1 : -1,
              } as CSSProperties
            }
          >
            <span className="motion-line" />
            {velocity !== 0 && (
              <span className="motion-badge">
                {velocity > 0 ? "→" : "←"} {Math.abs(velocity)} m/s
              </span>
            )}
          </div>
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
  );

  const superpositionSection = (
    <WaveMathLab
      frequency1={observedFrequency}
      frequency2={secondFrequency}
      amplitude1={amplitude}
      amplitude2={amplitude2}
      phase={phase}
      waveform={waveform}
      timeMs={timeMs}
      onTimeMsChange={setTimeMs}
    />
  );

  if (isMobile) {
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
            <Link to="/armonicos">Armónicos</Link>
            <Link to="/ejercicios">Ejercicios</Link>
            <span className={`status ${playing ? "is-live" : ""}`}>
              <i /> {playing ? "SEÑAL ACTIVA" : "EN ESPERA"}
            </span>
          </div>
        </header>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {scopeSection}
          {sidebarSection}
          {dopplerSection}
          {superpositionSection}
        </div>
      </main>
    );
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
          {/* 👉 NUEVO: Link para ir a la página de Armónicos */}
          <Link
            to="/armonicos"
            title="Ir a Síntesis Armónica"
            style={{
              fontSize: "13px",
              padding: "6px 12px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "inherit",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Armonicos
          </Link>
          <Link
            to="/ejercicios"
            title="Ir a Ejercicios"
            style={{
              fontSize: "13px",
              padding: "6px 12px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "inherit",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Ejercicios
          </Link>
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
        {sidebarSection}
        <div className="main-panel">
          {scopeSection}
          {superpositionSection}
          {dopplerSection}
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
  );
}
