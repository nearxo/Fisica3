import { useState } from "react"
import "./WaveMathLab.css"

interface WaveMathLabProps {
  frequency1: number
  frequency2: number
  amplitude1: number
  amplitude2: number
  phase: number
  waveform: string
  timeMs: number
  onTimeMsChange: (value: number) => void
}

export function WaveMathLab({
  frequency1,
  frequency2,
  amplitude1,
  amplitude2,
  phase,
  waveform,
  timeMs,
  onTimeMsChange
}: WaveMathLabProps) {
  const [setTimeMs] = useState(0)
  const [activeTab, setActiveTab] = useState<"beats" | "packets">("beats")

  const time = timeMs / 1000
  const phaseRad = (phase * Math.PI) / 180

  const angle1 = 2 * Math.PI * frequency1 * time
  const angle2 = 2 * Math.PI * frequency2 * time - phaseRad

  const wave1 = amplitude1 * Math.sin(angle1)
  const wave2 = amplitude2 * Math.sin(angle2)
  const resultant = wave1 + wave2

  const beatFrequency = Math.abs(frequency1 - frequency2)
  const meanFrequency = (frequency1 + frequency2) / 2
  const sameFrequency = beatFrequency < 0.001
  const equalAmplitudes = Math.abs(amplitude1 - amplitude2) < 0.001

  // Diferencia de fase instantánea en el tiempo t:
  // y1 ~ sin(angle1) y y2 ~ sin(angle1 - deltaPhi)
  const deltaPhi = 2 * Math.PI * (frequency1 - frequency2) * time + phaseRad
  const interferenceFactor = Math.cos(deltaPhi) // +1 constructiva, -1 destructiva

  const getInstantInterference = () => {
    if (interferenceFactor > 0.7) {
      return {
        label: "Constructiva",
        tone: "constructive",
        desc: "Las crestas y valles coinciden: el desplazamiento se refuerza."
      }
    }
    if (interferenceFactor < -0.7) {
      return {
        label: "Destructiva",
        tone: "destructive",
        desc: "Una onda tira hacia arriba y la otra hacia abajo: se restan."
      }
    }
    return {
      label: "Parcial / en transición",
      tone: "partial",
      desc: "Interferencia intermedia entre refuerzo máximo y cancelación."
    }
  }

  const instantInterference = getInstantInterference()

  // Envolvente instantánea cuando f1 ≠ f2 y A1 ≈ A2: |2A cos(pi * df * t - phi/2)|
  const envelopeInstant = equalAmplitudes
    ? Math.abs(
        2 *
          amplitude1 *
          Math.cos(Math.PI * beatFrequency * time - phaseRad / 2)
      )
    : Math.abs(wave1) + Math.abs(wave2)

  const resultantAmplitudeSameFreq = Math.sqrt(
    Math.max(
      0,
      amplitude1 ** 2 +
        amplitude2 ** 2 +
        2 * amplitude1 * amplitude2 * Math.cos(phaseRad)
    )
  )

  const maxEnvelopeAmplitude = amplitude1 + amplitude2
  const sumOfEnergies = amplitude1 ** 2 + amplitude2 ** 2
  const peakEnergy = sameFrequency
    ? resultantAmplitudeSameFreq ** 2
    : maxEnvelopeAmplitude ** 2
  const energyRatio = sumOfEnergies > 0 ? peakEnergy / sumOfEnergies : 0
  const energyBarPercent = Math.min((energyRatio / 4) * 100, 100)

  // Posición del indicador en la barra de interferencia (-1 a +1 -> 0% a 100%)
  const interferenceMarkerPercent = ((interferenceFactor + 1) / 2) * 100

  const hasEnvelope = !sameFrequency && beatFrequency <= 60
  const format = (value: number) => value.toFixed(4)
  const timeProgress = (timeMs / 10) * 100

  return (
    <section className="math-lab">
      <div className="math-lab-header">
        <div>
          <span className="math-eyebrow">LABORATORIO MATEMÁTICO · 03</span>
          <h2>Superposición de ondas</h2>
          <p>
            Interferencia en tiempo real, envolventes de pulsación y física de
            paquetes de ondas.
          </p>
        </div>

        <span className="math-status">MODELO ACTIVO</span>
      </div>

      {/* ECUACIONES PRINCIPALES */}
      <div className="math-equations">
        <div className="equation-card wave-one">
          <span>ONDA 1</span>
          <div className="equation">
            y₁(t) = {amplitude1.toFixed(2)} · sen(2π · {frequency1.toFixed(1)} · t)
          </div>
          <small>y₁({timeMs.toFixed(1)} ms) = {format(wave1)}</small>
        </div>

        <div className="equation-card wave-two">
          <span>ONDA 2</span>
          <div className="equation">
            y₂(t) = {amplitude2.toFixed(2)} · sen(2π · {frequency2.toFixed(1)} · t −{" "}
            {phase.toFixed(0)}°)
          </div>
          <small>y₂({timeMs.toFixed(1)} ms) = {format(wave2)}</small>
        </div>

        <div className="equation-card resultant-card">
          <span>FUNCIÓN RESULTANTE</span>
          <div className="equation">y_R(t) = y₁(t) + y₂(t)</div>
          <small>y_R({timeMs.toFixed(1)} ms) = {format(resultant)}</small>
        </div>
      </div>

      {/* MEDIDOR DE INTERFERENCIA CONSTRUCTIVA / DESTRUCTIVA */}
      <div className="interference-box">
        <div className="interference-top">
          <div>
            <span className="math-eyebrow">INTERFERENCIA EN t = {timeMs.toFixed(2)} ms</span>
            <div className="interference-title-row">
              <strong className={`regime-pill ${instantInterference.tone}`}>
                {instantInterference.label}
              </strong>
              <span className="cos-readout">
                cos(Δφ) = {interferenceFactor >= 0 ? "+" : ""}
                {interferenceFactor.toFixed(2)}
              </span>
            </div>
          </div>
          <small>{instantInterference.desc}</small>
        </div>

        <div className="interference-scale">
          <span>Destructiva (−1)</span>
          <span>Parcial (0)</span>
          <span>Constructiva (+1)</span>
        </div>
        <div className="interference-track">
          <i
            className="interference-marker"
            style={{ left: `${interferenceMarkerPercent}%` }}
          />
        </div>
      </div>

      {/* CONTROL DEL TIEMPO */}
      <div className="math-time-control">
        <label>
          <div className="math-time-header">
            <span>INSTANTE DE EVALUACIÓN (t)</span>
            <strong>
              {timeMs.toFixed(2)} ms · {time.toFixed(5)} s
            </strong>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={0.05}
            value={timeMs}
            onChange={(e) => onTimeMsChange(Number(e.target.value))}
            style={{ "--progress": `${timeProgress}%` } as React.CSSProperties}
          />
        </label>
      </div>

      {/* PROPIEDADES FÍSICAS */}
      <div className="math-properties-grid">
        <div className="property-item">
          <small>PULSACIÓN (|f₁ − f₂|)</small>
          <strong>{beatFrequency.toFixed(2)} Hz</strong>
          <span>
            {beatFrequency > 0
              ? `Latido cada ${(1000 / beatFrequency).toFixed(1)} ms`
              : "Frecuencias iguales: sin pulsación"}
          </span>
        </div>

        <div className="property-item">
          <small>FRECUENCIA MEDIA</small>
          <strong>{meanFrequency.toFixed(2)} Hz</strong>
          <span>Portadora central (f₁ + f₂) / 2</span>
        </div>

        <div className="property-item">
          <small>
            {sameFrequency ? "AMPLITUD RESULTANTE" : "ENVOLVENTE EN t"}
          </small>
          <strong>
            {sameFrequency
              ? resultantAmplitudeSameFreq.toFixed(3)
              : envelopeInstant.toFixed(3)}
          </strong>
          <span>
            {sameFrequency
              ? `Fija para φ = ${phase.toFixed(0)}°`
              : `Máxima teórica: ${maxEnvelopeAmplitude.toFixed(3)}`}
          </span>
        </div>

        <div className="property-item">
          <small>ENERGÍA PICO RELATIVA</small>
          <strong>{(energyRatio * 100).toFixed(0)}%</strong>
          <div className="energy-bar">
            <i style={{ width: `${energyBarPercent}%` }} />
          </div>
          <span>Escala ∝ A² frente a E₁ + E₂</span>
        </div>
      </div>

      {/* EXPLORADOR CONCEPTUAL: ENVOLVENTE Y PULSACIONES vs PAQUETES DE ONDAS */}
      <div className="concept-panel">
        <div className="concept-tabs" role="tablist">
          <button
            type="button"
            className={activeTab === "beats" ? "is-active" : ""}
            onClick={() => setActiveTab("beats")}
          >
            Envolvente y pulsaciones
          </button>
          <button
            type="button"
            className={activeTab === "packets" ? "is-active" : ""}
            onClick={() => setActiveTab("packets")}
          >
            Paquetes de ondas
          </button>
        </div>

        {activeTab === "beats" ? (
          <div className="concept-body">
            <div className="concept-badge-line">
              <span className={`envelope-tag ${hasEnvelope ? "is-on" : "is-off"}`}>
                {hasEnvelope
                  ? "ENVOLVENTE ACTIVA (MODULACIÓN DE AMPLITUD)"
                  : sameFrequency
                    ? "SIN ENVOLVENTE DE BATIDO (MISMA FRECUENCIA)"
                    : "SEPARACIÓN AMPLIA (BATIDO RÁPIDO)"}
              </span>
            </div>

            {equalAmplitudes && !sameFrequency && (
              <p className="equation-main">
                y_R(t) = [2·{amplitude1.toFixed(2)} · cos(π·{beatFrequency.toFixed(2)}·t − φ/2)] · sen(2π·{meanFrequency.toFixed(1)}·t − φ/2)
              </p>
            )}

            <p>
              Cuando dos ondas tienen frecuencias cercanas (|f₁ − f₂| pequeña),
              pasan alternadamente de estar <strong>en fase</strong>{" "}
              (interferencia constructiva, amplitud máxima) a estar{" "}
              <strong>en oposición de fase</strong> (interferencia destructiva,
              mínimo o nodo de amplitud).
            </p>
            <p>
              Ese ciclo lento que "envuelve" a la oscilación rápida se llama{" "}
              <strong>envolvente</strong>, y la frecuencia con la que crece y
              decrece la amplitud es la <strong>frecuencia de pulsación</strong>{" "}
              f_pulsación = |f₁ − f₂|. No crea una frecuencia fundamental nueva
              en el espectro: es una modulación de amplitud de la onda portadora
              cercana a f_media.
            </p>
          </div>
        ) : (
          <div className="concept-body">
            <div className="concept-badge-line">
              <span className="envelope-tag is-info">
                2 ONDAS = PULSACIÓN PERIÓDICA · MUCHAS ONDAS = PAQUETE LOCALIZADO
              </span>
            </div>

            <p>
              Un <strong>paquete de ondas</strong> (o grupo de ondas) es una
              perturbación localizada en el espacio o en el tiempo —como un
              pulso luminoso, una onda sísmica corta o un electrón cuántico—
              que empieza, alcanza un pico y se apaga fuera de una región.
            </p>
            <p>
              Con <strong>solo dos ondas</strong> puras, la interferencia se
              repite periódicamente de forma infinita (como una cadena de
              pulsaciones), nunca queda confinada a un único pulso aislado. Para
              construir un paquete localizado hace falta sumar{" "}
              <strong>muchas ondas con frecuencias ligeramente distintas</strong>{" "}
              (un ancho de banda Δf): dentro del paquete suman constructivamente
              y fuera se cancelan por interferencia destructiva.
            </p>
            <p>
              En un paquete de ondas aparecen dos velocidades distintas: la{" "}
              <strong>velocidad de fase</strong> (a qué velocidad avanzan las
              crestas individuales dentro del paquete) y la{" "}
              <strong>velocidad de grupo</strong> (a qué velocidad se desplaza la
              envolvente que contiene la energía del paquete).
            </p>
          </div>
        )}
      </div>

      {waveform !== "sine" && (
        <div className="math-warning">
          Las ecuaciones de este laboratorio corresponden a ondas sinusoidales.
          Selecciona la forma de onda seno en el oscilador principal para que
          los cálculos coincidan con la representación de la señal.
        </div>
      )}
    </section>
  )
}