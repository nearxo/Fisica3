
import React from "react";
import type { PhysicsExercise } from "./types/exercises";

interface Props {
  exercise: PhysicsExercise;
}

const difficultyLabels = {
  basic: "Básico",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const categoryLabels: Record<string, string> = {
  "wave-motion": "Movimiento ondulatorio",
  "wave-speed": "Rapidez de onda",
  "wave-power": "Potencia en ondas",
  "sound-waves": "Ondas sonoras",
  doppler: "Efecto Doppler",
  interference: "Interferencia",
  "standing-waves": "Ondas estacionarias",
  harmonics: "Armónicos",
  resonance: "Resonancia",
  superposition: "Superposición",
};

export default function ExerciseHeader({ exercise }: Props) {
  return (
    <header className="exercise-header">
      <div className="exercise-header-top">
        <span className="exercise-chapter">
          CAPÍTULO {exercise.chapter}
        </span>
        <span className={`exercise-difficulty ${exercise.difficulty}`}>
          {difficultyLabels[exercise.difficulty]}
        </span>
      </div>

      <div className="exercise-header-content">
        <span className="exercise-number">
          EJERCICIO {exercise.number}
        </span>

        <h1>{exercise.title}</h1>

        <div className="exercise-tags">
          <span>{categoryLabels[exercise.category] ?? exercise.category}</span>
          <span>
            {exercise.type === "worked-example"
              ? "Ejemplo resuelto"
              : "Problema propuesto"}
          </span>
        </div>
      </div>
    </header>
  );
}
