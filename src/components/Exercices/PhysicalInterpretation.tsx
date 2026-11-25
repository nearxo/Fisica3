
import React from "react";

interface Props {
  observations: string[];
}

export default function PhysicalInterpretation({
  observations,
}: Props) {
  if (!observations.length) return null;

  return (
    <section className="scientific-section interpretation-section">
      <div className="section-heading">
        <span className="section-index">06</span>
        <div>
          <h2>Interpretación física</h2>
          <p>Significado de los resultados obtenidos</p>
        </div>
      </div>

      <div className="interpretation-list">
        {observations.map((observation, index) => (
          <div
            className="interpretation-item"
            key={index}
          >
            <span className="interpretation-marker">
              {index + 1}
            </span>

            <p>{observation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
