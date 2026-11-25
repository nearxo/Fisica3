
import React from "react";
import type { PhysicalVariable } from "./types/exercises";
import {
  VariableDisplay,
} from "./ScientificMath";

interface Props {
  givenData: PhysicalVariable[];
  unknowns: PhysicalVariable[];
}

function VariableList({
  title,
  variables,
  emptyMessage,
}: {
  title: string;
  variables: PhysicalVariable[];
  emptyMessage: string;
}) {
  return (
    <div className="variable-panel">
      <h3>{title}</h3>

      {variables.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p>
      ) : (
        <div className="variable-list">
          {variables.map((variable, index) => (
            <div key={`${variable.symbol}-${index}`}>
              <VariableDisplay
                symbol={variable.symbol}
                value={variable.value}
                unit={variable.unit}
                label={variable.name}
              />

              {variable.description && (
                <p className="variable-description">
                  {variable.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GivenDataPanel({
  givenData,
  unknowns,
}: Props) {
  return (
    <section className="scientific-section">
      <div className="section-heading">
        <span className="section-index">02</span>
        <div>
          <h2>Datos e incógnitas</h2>
          <p>Magnitudes físicas del problema</p>
        </div>
      </div>

      <div className="data-grid">
        <VariableList
          title="Datos conocidos"
          variables={givenData}
          emptyMessage="No se han definido datos."
        />

        <VariableList
          title="Incógnitas"
          variables={unknowns}
          emptyMessage="No hay incógnitas pendientes."
        />
      </div>
    </section>
  );
}
