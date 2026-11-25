
import React from "react";
import type { PhysicsFormula } from "./types/exercises";
import { FormulaCard } from "./ScientificMath";

interface Props {
  formulas: PhysicsFormula[];
}

export default function FormulaSection({ formulas }: Props) {
  return (
    <section className="scientific-section">
      <div className="section-heading">
        <span className="section-index">03</span>
        <div>
          <h2>Fundamento matemático</h2>
          <p>Leyes y ecuaciones utilizadas</p>
        </div>
      </div>

      <div className="formula-list">
        {formulas.map((formula) => (
          <FormulaCard
            key={formula.id}
            title={formula.name}
            expression={formula.expression}
            description={formula.description}
          />
        ))}
      </div>
    </section>
  );
}
