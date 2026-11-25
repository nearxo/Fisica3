
import React from "react";

interface Props {
  statement: string;
}

export default function ExerciseStatement({ statement }: Props) {
  return (
    <section className="scientific-section statement-section">
      <div className="section-heading">
        <span className="section-index">01</span>
        <div>
          <h2>Planteamiento del problema</h2>
          <p>Descripción física del fenómeno</p>
        </div>
      </div>

      <div className="statement-content">
        <p>{statement}</p>
      </div>
    </section>
  );
}
