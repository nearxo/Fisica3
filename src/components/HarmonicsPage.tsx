import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Icon } from "./Icon";
import { Slider } from "./Slider";

interface ModeItem {
  id: string; // Identificador único
  modeNumber: number; // Número de modo / armónico (1, 2, 3...)
  amplitude: number; // Amplitud individual (0 a 1)
}
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
};

export function HarmonicsPage() {
  const [fundamental, setFundamental] = useState<number>(110);
  const minFreq = 55;
  const maxFreq = 440;
  const progress = ((fundamental - minFreq) / (maxFreq - minFreq)) * 100;
  // Iniciamos mostrando únicamente la onda fundamental (Modo 1)
  const [modes, setModes] = useState<ModeItem[]>([
    { id: "fundamental-1", modeNumber: 1, amplitude: 1.0 },
  ]);

  // Campo de entrada para añadir nuevos modos
  const [newModeInput, setNewModeInput] = useState<number>(2);
  const [playing, setPlaying] = useState<boolean>(false);

  const audioRef = useRef<{
    context: AudioContext;
    oscillators: OscillatorNode[];
    gains: GainNode[];
    master: GainNode;
  } | null>(null);

  const totalAmplitude = modes.reduce((sum, m) => sum + m.amplitude, 0);

  // Añadir un nuevo modo/armónico
  const handleAddMode = (e: React.FormEvent) => {
    e.preventDefault();
    const modeNum = Number(newModeInput);
    if (!modeNum || modeNum < 1) return;

    const newMode: ModeItem = {
      id: `${modeNum}-${Date.now()}`,
      modeNumber: modeNum,
      amplitude: 0.5, // Amplitud por defecto
    };

    setModes((prev) => [...prev, newMode]);
    setNewModeInput(modeNum + 1); // Auto-incrementar sugerencia para el siguiente modo
  };

  // Eliminar un modo
  const handleRemoveMode = (id: string) => {
    // Evitamos dejar vacía la lista si se requiere mantener al menos una
    if (modes.length <= 1) return;
    setModes((prev) => prev.filter((m) => m.id !== id));
  };

  // Actualizar la amplitud de un modo específico
  const handleAmplitudeChange = (id: string, newAmp: number) => {
    setModes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, amplitude: newAmp } : m)),
    );
  };

  // Suma matemática de la onda resultante (superposición)
  const samples = useMemo(() => {
    const count = 500;
    const normalization = Math.max(1, totalAmplitude);

    return Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1) / fundamental;

      const value = modes.reduce((sum, mode) => {
        return (
          sum +
          mode.amplitude *
            Math.sin(2 * Math.PI * mode.modeNumber * fundamental * t)
        );
      }, 0);

      return {
        x: (i / (count - 1)) * 1000,
        y: 100 - (value / normalization) * 75,
      };
    });
  }, [fundamental, modes, totalAmplitude]);

  const waveformPoints = samples.map((p) => `${p.x},${p.y}`).join(" ");

  // Manejo de la Web Audio API (Crear / Destruir osciladores cuando cambian los modos)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;

    const context = audio.context;
    const now = context.currentTime;

    // Detener osciladores anteriores para sincronizar con los modos actuales
    audio.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });

    const newOscillators: OscillatorNode[] = [];
    const newGains: GainNode[] = [];

    modes.forEach((mode) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(fundamental * mode.modeNumber, now);
      gain.gain.setValueAtTime(
        mode.amplitude / Math.max(1, totalAmplitude),
        now,
      );

      osc.connect(gain);
      gain.connect(audio.master);
      osc.start();

      newOscillators.push(osc);
      newGains.push(gain);
    });

    audio.oscillators = newOscillators;
    audio.gains = newGains;
  }, [fundamental, modes, playing, totalAmplitude]);

  // Iniciar reproducción
  const startAudio = async () => {
    if (audioRef.current) return;

    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0.2;
    master.connect(context.destination);

    audioRef.current = { context, oscillators: [], gains: [], master };
    await context.resume();
    setPlaying(true);
  };

  // Detener reproducción
  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
    });
    void audio.context.close();
    audioRef.current = null;
    setPlaying(false);
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.oscillators.forEach((osc) => {
          try {
            osc.stop();
          } catch {}
        });
        void audioRef.current.context.close();
        audioRef.current = null;
      }
    };
  }, []);

  const reset = () => {
    stopAudio();
    setFundamental(110);
    setModes([{ id: "fundamental-1", modeNumber: 1, amplitude: 1.0 }]);
    setNewModeInput(2);
  };

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 24,
        color: "var(--text-primary, #f4f4f5)",
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <div className="topbar">
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
              <Link
                to="/armonicos"
                title="Ir a Síntesis Armónica"
                style={navLinkStyle}
              >
                Armonicos
              </Link>
              <Link
                to="/Ejercicios"
                title="Ir a Ejercicios"
                style={navLinkStyle}
              >
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
        </div>

        <div className="page-hero" style={{ marginTop: 20 }}>
          <p style={{ color: "#38bdf8", letterSpacing: 3, margin: 0 }}>
            ONDULAB / SÍNTESIS ARMÓNICA
          </p>
          <h1 style={{ margin: "6px 0 8px" }}>Modos de vibración y timbre</h1>
          <p style={{ margin: 0 }}>
            Agrega nuevos modos de vibración dividiendo la frecuencia
            fundamental y observa la súperposición de ondas resultantes.
          </p>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 24,
        }}
      >
        {/* PANEL DE PARÁMETROS Y CONTROL DE MODOS */}
        <div>
          <h2>Parámetros de la Fundamental</h2>

          <label style={{ display: "block", margin: "20px 0" }}>
            <span>Frecuencia fundamental : {fundamental} Hz</span>
            <Slider
              label="FRECUENCIA FUNDAMENTAL"
              value={fundamental}
              min={55}
              max={440}
              step={1}
              unit="Hz"
              onChange={setFundamental}
            />
          </label>

          <hr style={{ borderColor: "#27272a", margin: "24px 0" }} />

          <h2>Añadir más modos (Ondas)</h2>
          <form
            onSubmit={handleAddMode}
            style={{ display: "flex", gap: 12, marginBottom: 24 }}
          >
            <input
              type="number"
              min={1}
              max={32}
              value={newModeInput}
              onChange={(e) => setNewModeInput(Number(e.target.value))}
              style={{
                width: 80,
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #3f3f46",
                background: "#18181b",
                color: "#fff",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background: "#38bdf8",
                color: "#09090b",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              + Añadir Modo {newModeInput}
            </button>
          </form>

          <h3>Modos Activos ({modes.length})</h3>
          <div style={{ maxHeight: 350, overflowY: "auto", paddingRight: 8 }}>
            {modes.map((mode) => {
              const freq = mode.modeNumber * fundamental;
              return (
                <div
                  key={mode.id}
                  style={{
                    background: "#18181b",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                    border: "1px solid #27272a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span>
                      <strong>Modo {mode.modeNumber}</strong> · {freq} Hz
                    </span>
                    {modes.length > 1 && (
                      <button
                        onClick={() => handleRemoveMode(mode.id)}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "2px 8px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <Slider
                    label="AMPLITUD"
                    value={mode.amplitude}
                    min={0}
                    max={1}
                    step={0.01}
                    unit=""
                    onChange={(val) => handleAmplitudeChange(mode.id, val)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* VISUALIZACIÓN DE LA ONDA Y COMPONENTES */}
        <div>
          <h2>Onda Resultante (Superposición)</h2>
          <svg
            viewBox="0 0 1000 200"
            role="img"
            aria-label="Gráfica de la suma de los armónicos"
            style={{
              width: "100%",
              background: "#101923",
              borderRadius: 12,
            }}
          >
            <line
              x1="0"
              y1="100"
              x2="1000"
              y2="100"
              stroke="#526171"
              strokeDasharray="6 6"
            />
            <polyline
              points={waveformPoints}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              onClick={playing ? stopAudio : startAudio}
              style={{
                padding: "12px 18px",
                cursor: "pointer",
                background: playing ? "#ef4444" : "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: "bold",
              }}
            >
              {playing ? "Detener sonido" : "Reproducir timbre"}
            </button>
            <button
              onClick={reset}
              style={{
                padding: "12px 18px",
                cursor: "pointer",
                background: "#3f3f46",
                color: "#fff",
                border: "none",
                borderRadius: 6,
              }}
            >
              Restablecer
            </button>
          </div>

          <h2 style={{ marginTop: 32 }}>Componentes Armónicas Individuales</h2>
          {modes.map((mode) => (
            <div key={mode.id} style={{ marginBottom: 12 }}>
              <small style={{ color: "#a1a1aa" }}>
                Modo {mode.modeNumber}: {mode.modeNumber} × {fundamental} Hz ={" "}
                {mode.modeNumber * fundamental} Hz
              </small>
              <svg
                viewBox="0 0 1000 70"
                style={{
                  width: "100%",
                  background: "#101923",
                  borderRadius: 8,
                  display: "block",
                  marginTop: 4,
                }}
              >
                <line x1="0" y1="35" x2="1000" y2="35" stroke="#334155" />
                <polyline
                  points={Array.from({ length: 300 }, (_, i) => {
                    const x = i / 299;
                    const y =
                      35 -
                      mode.amplitude *
                        25 *
                        Math.sin(2 * Math.PI * mode.modeNumber * x);
                    return `${x * 1000},${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
