
import React from "react";
import type { ExerciseResult } from "./types/exercises";
import { MathResult } from "./ScientificMath";

interface Props {
  results: ExerciseResult[];
}

export default function ResultsPanel({ results }: Props) {
  return (
    <section className="scientific-section results-section">
      <div className="section-heading">
        <span className="section-index">05</span>
        <div>
          <h2>Resultados finales</h2>
          <p>Soluciones obtenidas del procedimiento</p>
        </div>
      </div>

      <div className="results-grid">
        {results.map((result, index) => {
          const expression =
            result.expression ||
            `${result.symbol}=${result.value}${
              result.unit
                ? `\\,\\mathrm{${result.unit.replace("/", "\\,/\\,")}}`
                : ""
            }`;

          return (
            <div
              className="result-card"
              key={`${result.symbol}-${index}`}
            >
              <MathResult
                title={result.label}
                expression={expression}
                description={result.description}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
