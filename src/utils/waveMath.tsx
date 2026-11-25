import { Waveform } from "../types/audio"

export const waveformLabels: Record<Waveform, string> = {
  sine: "Seno",
  square: "Cuadrada",
  sawtooth: "Sierra",
  triangle: "Triangular",
  custom: "Personalizada",
}

export const waveformShort: Record<Waveform, string> = {
  sine: "SIN",
  square: "SQR",
  sawtooth: "SAW",
  triangle: "TRI",
  custom: "CUS",
}

export function waveValue(type: Waveform, phase: number): number {
  const normalized = (((phase / (Math.PI * 2)) % 1) + 1) % 1
  if (type === "square") return Math.sin(phase) >= 0 ? 1 : -1
  if (type === "sawtooth") return 2 * normalized - 1
  if (type === "triangle") return 1 - 4 * Math.abs(normalized - 0.5)
  return Math.sin(phase)
}