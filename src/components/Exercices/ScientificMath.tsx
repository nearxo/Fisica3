
import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface ScientificMathProps {
  expression: string;
  display?: boolean;
  className?: string;
  color?: string;
  fontSize?: string;
}

export function ScientificMath({
  expression,
  display = true,
  className = "",
  color = "inherit",
  fontSize = "1.15rem",
}: ScientificMathProps) {
  return (
    <div
      className={`scientific-math ${className}`}
      style={{
        color,
        fontSize,
        overflowX: "auto",
        padding: display ? "12px 4px" : "0",
      }}
    >
      {display ? (
        <BlockMath math={expression} />
      ) : (
        <InlineMath math={expression} />
      )}
    </div>
  );
}

// Fórmula destacada con descripción
interface FormulaCardProps {
  title: string;
  expression: string;
  description?: string;
}

export function FormulaCard({
  title,
  expression,
  description,
}: FormulaCardProps) {
  return (
    <div className="formula-card">
      <h4 className="formula-card-title">{title}</h4>

      <ScientificMath
        expression={expression}
        display
        fontSize="1.3rem"
      />

      {description && (
        <p className="formula-card-description">
          {description}
        </p>
      )}
    </div>
  );
}

// Desarrollo de una operación matemática
interface CalculationProps {
  title?: string;
  expression: string;
  result?: string;
  unit?: string;
}

export function Calculation({
  title,
  expression,
  result,
  unit,
}: CalculationProps) {
  return (
    <div className="calculation-block">
      {title && <h4>{title}</h4>}

      <ScientificMath expression={expression} />

      {result && (
        <div className="calculation-result">
          <ScientificMath
            expression={`${result}${unit ? `\\,\\mathrm{${unit}}` : ""}`}
            color="var(--physics-accent, #38bdf8)"
          />
        </div>
      )}
    </div>
  );
}

// Variables físicas con sus símbolos
interface VariableDisplayProps {
  symbol: string;
  value: string | number;
  unit?: string;
  label?: string;
}

export function VariableDisplay({
  symbol,
  value,
  unit = "",
  label,
}: VariableDisplayProps) {
  return (
    <div className="variable-display">
      <div className="variable-symbol">
        <ScientificMath
          expression={symbol}
          display={false}
        />
      </div>

      <div className="variable-information">
        {label && <span>{label}</span>}

        <strong>
          {value} {unit}
        </strong>
      </div>
    </div>
  );
}

// Bloque de resultado final
interface MathResultProps {
  title?: string;
  expression: string;
  description?: string;
}

export function MathResult({
  title = "Resultado",
  expression,
  description,
}: MathResultProps) {
  return (
    <div className="math-result">
      <span className="math-result-label">{title}</span>

      <ScientificMath
        expression={expression}
        color="var(--physics-success, #10b981)"
        fontSize="1.4rem"
      />

      {description && (
        <p>{description}</p>
      )}
    </div>
  );
}
