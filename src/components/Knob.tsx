import { useRef } from "react"
import type { CSSProperties, PointerEvent } from "react"

export function Knob({
  label,
  value,
  min,
  max,
  step,
  unit,
  accent = "cyan",
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  accent?: "cyan" | "violet" | "amber"
  onChange: (value: number) => void
}) {
  const progress = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const angle = -132 + progress * 264
  const dragging = useRef(false)
  const lastY = useRef(0)

  const updateValue = (next: number) => {
    const stepped = Math.round((next - min) / step) * step + min
    const precision = step.toString().includes(".")
      ? step.toString().split(".")[1].length
      : 0

    onChange(Number(Math.max(min, Math.min(max, stepped)).toFixed(precision)))
  }

  const handlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    dragging.current = true
    lastY.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!dragging.current) return

    const delta = lastY.current - event.clientY
    lastY.current = event.clientY

    // Arrastrar hacia arriba aumenta el valor.
    updateValue(value + delta * step * 2)
  }

  const handlePointerUp = () => {
    dragging.current = false
  }

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    updateValue(value + (event.deltaY < 0 ? step : -step))
  }

  return (
    <label className={`knob-control ${accent}`}>
      <span className="knob-label">{label}</span>

      <span
        className="knob"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{ "--angle": `${angle}deg` } as CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp" || event.key === "ArrowRight") {
            event.preventDefault()
            updateValue(value + step)
          }
          if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
            event.preventDefault()
            updateValue(value - step)
          }
        }}
        onWheel={handleWheel as unknown as React.WheelEventHandler<HTMLSpanElement>}
      >
        <span className="knob-tick" />
      </span>

      <input
        className="sr-only"
        type="range"
        aria-label={`${label} control`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => updateValue(Number(event.target.value))}
      />

      <span className="knob-value">
        {Number.isInteger(step) ? Math.round(value) : value.toFixed(2)}
        <small>{unit}</small>
      </span>
    </label>
  )
}