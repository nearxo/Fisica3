
import React, { useState } from "react";

import type { PhysicsExercise } from "./types/exercises";
import "./ExerciseContainer.css";
import ExerciseHeader from "./ExerciseHeader";
import ExerciseStatement from "./ExerciseStatement";
import GivenDataPanel from "./GivenDataPanel";
import FormulaSection from "./FormulaSection";
import SolutionSteps from "./SolutionSteps";
import ResultsPanel from "./ResultsPanel";
import PhysicalInterpretation from "./PhysicalInterpretation";
import ExerciseVisualization from "./ExerciseVisualization";

interface Props {
  exercise: PhysicsExercise;
}

export default function ExerciseContainer({ exercise }: Props) {
  const [showSolution, setShowSolution] = useState(true);

  return (
    <main className="exercise-container">

      <ExerciseHeader exercise={exercise} />

      <div className="exercise-body">

        <ExerciseStatement
          statement={exercise.statement}
        />

        <GivenDataPanel
          givenData={exercise.givenData}
          unknowns={exercise.unknowns}
        />

        <FormulaSection
          formulas={exercise.formulas}
        />

        <div className="solution-toggle">
          <div>
            <h2>Resolución matemática</h2>
            <p>
              Consulta el procedimiento completo del ejercicio.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSolution((previous) => !previous)}
            aria-expanded={showSolution}
          >
            {showSolution
              ? "Ocultar desarrollo"
              : "Mostrar desarrollo"}
          </button>
        </div>

        {showSolution && (
          <>
            <SolutionSteps
              steps={exercise.steps}
            />

            <ResultsPanel
              results={exercise.results}
            />

            <PhysicalInterpretation
              observations={exercise.observations || []}
            />
          </>
        )}

        <ExerciseVisualization
          visualization={exercise.visualization}
        />

      </div>

      <footer className="exercise-footer">
        <span>ONDULAB / FÍSICA III</span>
        <span>
          Capítulo {exercise.chapter} · Ejercicio {exercise.number}
        </span>
      </footer>

    </main>
  );
}
