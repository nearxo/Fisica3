
import React from "react";
import type {
  SolutionStep,
  SolutionStepType,
} from "./types/exercises";

import { ScientificMath } from "./ScientificMath";

interface Props {
  steps: SolutionStep[];
}

const stepLabels: Record<SolutionStepType, string> = {
  analysis: "ANÁLISIS FÍSICO",
  formula: "ECUACIÓN",
  substitution: "SUSTITUCIÓN",
  calculation: "CÁLCULO",
  result: "RESULTADO PARCIAL",
  interpretation: "ANÁLISIS",
  warning: "OBSERVACIÓN",
};

const stepIcons: Record<SolutionStepType, string> = {
  analysis: "01",
  formula: "02",
  substitution: "03",
  calculation: "04",
  result: "05",
  interpretation: "06",
  warning: "!",
};

export default function SolutionSteps({ steps }: Props) {
  return (
    <section className="scientific-section">
      <div className="section-heading">
        <span className="section-index">04</span>
        <div>
          <h2>Desarrollo de la solución</h2>
          <p>Procedimiento matemático paso a paso</p>
        </div>
      </div>

      <div className="solution-timeline">
        {steps.map((step, index) => (
          <article
            key={step.id}
            className={`solution-step step-${step.type}`}
          >
            <div className="step-marker">
              {stepIcons[step.type] || index + 1}
            </div>

            <div className="step-content">
              <div className="step-meta">
                <span>{stepLabels[step.type]}</span>
                <span>PASO {index + 1}</span>
              </div>

              <h3>{step.title}</h3>

              <p className="step-explanation">
                {step.explanation}
              </p>

              {step.equation && (
                <div className="step-equation">
                  <ScientificMath
                    expression={step.equation}
                  />
                </div>
              )}

              {step.calculation && (
                <div className="step-calculation">
                  <span>DESARROLLO NUMÉRICO</span>
                  <ScientificMath
                    expression={step.calculation}
                  />
                </div>
              )}

              {step.result && (
                <div className="step-result">
                  <ScientificMath
                    expression={step.result}
                    color="var(--physics-accent, #38bdf8)"
                  />

                  {step.unit && (
                    <span>{step.unit}</span>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
