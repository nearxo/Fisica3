
import React from "react";
import type {
  ExerciseVisualization as VisualizationData,
} from "./types/exercises";

interface Props {
  visualization?: VisualizationData;
}

function WaveDiagram({
  standing = false,
}: {
  standing?: boolean;
}) {
  const paths = Array.from({ length: standing ? 5 : 1 }, (_, index) => {
    const points = Array.from({ length: 201 }, (_, i) => {
      const x = (i / 200) * 800;
      const phase = (i / 200) * Math.PI * 6;
      const envelope = standing
        ? Math.sin((i / 200) * Math.PI * 6)
        : 1;

      const y =
        100 -
        55 *
          Math.sin(phase) *
          envelope *
          (standing ? 1 : 1);

      return `${x},${y}`;
    });

    return points.join(" ");
  });

  return (
    <svg
      viewBox="0 0 800 200"
      role="img"
      aria-label={
        standing
          ? "Representación de una onda estacionaria"
          : "Representación de una onda sinusoidal"
      }
      className="physics-diagram"
    >
      <line
        x1="0"
        y1="100"
        x2="800"
        y2="100"
        stroke="currentColor"
        opacity="0.3"
        strokeDasharray="5 5"
      />

      {standing && (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((n) => (
            <line
              key={n}
              x1={(n / 6) * 800}
              y1="25"
              x2={(n / 6) * 800}
              y2="175"
              stroke="#94a3b8"
              opacity="0.35"
              strokeDasharray="3 5"
            />
          ))}
        </>
      )}

      {paths.map((points, index) => (
        <polyline
          key={index}
          points={points}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

export default function ExerciseVisualization({
  visualization,
}: Props) {
  if (!visualization || visualization.type === "none") {
    return null;
  }

  const renderDiagram = () => {
    switch (visualization.type) {
      case "wave":
        return <WaveDiagram />;

      case "standing-wave":
        return <WaveDiagram standing />;

      default:
        return (
          <div className="visualization-placeholder">
            
          </div>
        );
    }
  };

  return (
    <section className="scientific-section visualization-section">
      <div className="section-heading">
        <span className="section-index">07</span>
        <div>
          <h2>{visualization.title}</h2>
          <p>
            {visualization.description ||
              "Representación gráfica del fenómeno físico"}
          </p>
        </div>
      </div>

      <div className="visualization-container">
        {renderDiagram()}
      </div>
    </section>
  );
}
