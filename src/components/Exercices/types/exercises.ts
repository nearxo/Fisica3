
/**
 * MODELO DE DATOS PARA EJERCICIOS DE FÍSICA
 * Ondulab - Física III
 */

// --------------------------------------------------
// TIPOS GENERALES
// --------------------------------------------------

export type PhysicsChapter = 16 | 17 | 18;

export type ExerciseType =
  | "worked-example"
  | "proposed-problem";

export type ExerciseCategory =
  | "wave-motion"
  | "wave-speed"
  | "wave-power"
  | "sound-waves"
  | "doppler"
  | "interference"
  | "standing-waves"
  | "harmonics"
  | "resonance"
  | "superposition";

export type Difficulty =
  | "basic"
  | "intermediate"
  | "advanced";

// --------------------------------------------------
// DATOS FÍSICOS
// --------------------------------------------------

export interface PhysicalVariable {
  symbol: string;
  name: string;
  value: number | string;
  unit: string;
  description?: string;
}

export interface PhysicalConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
}

// --------------------------------------------------
// FÓRMULAS
// --------------------------------------------------

export interface PhysicsFormula {
  id: string;
  name: string;

  // Expresión matemática en LaTeX
  expression: string;

  // Descripción de cuándo se utiliza
  description?: string;

  // Variables que intervienen
  variables?: string[];
}

// --------------------------------------------------
// DESARROLLO MATEMÁTICO
// --------------------------------------------------

export type SolutionStepType =
  | "analysis"
  | "formula"
  | "substitution"
  | "calculation"
  | "result"
  | "interpretation"
  | "warning";

export interface SolutionStep {
  id: string;
  title: string;
  type: SolutionStepType;

  // Explicación del procedimiento
  explanation: string;

  // Fórmula matemática opcional
  equation?: string;

  // Desarrollo o sustitución numérica
  calculation?: string;

  // Resultado específico del paso
  result?: string;

  // Unidad del resultado
  unit?: string;
}

// --------------------------------------------------
// RESULTADOS
// --------------------------------------------------

export interface ExerciseResult {
  symbol: string;
  label: string;

  // Resultado numérico
  value: number | string;

  unit: string;

  // Resultado expresado en LaTeX
  expression?: string;

  description?: string;
}

// --------------------------------------------------
// VISUALIZACIONES CIENTÍFICAS
// --------------------------------------------------

export type VisualizationType =
  | "wave"
  | "standing-wave"
  | "doppler"
  | "interference"
  | "string"
  | "sound-tube"
  | "none";

export interface ExerciseVisualization {
  type: VisualizationType;
  title: string;
  description?: string;

  // Parámetros para construir la visualización
  parameters?: Record<string, number | string | boolean>;
}

// --------------------------------------------------
// EJERCICIO COMPLETO
// --------------------------------------------------

export interface PhysicsExercise {
  id: string;

  // Identificación
  number: string;
  title: string;
  chapter: PhysicsChapter;
  type: ExerciseType;
  category: ExerciseCategory;
  difficulty: Difficulty;

  // Enunciado original
  statement: string;

  // Información física
  givenData: PhysicalVariable[];
  unknowns: PhysicalVariable[];

  // Desarrollo científico
  formulas: PhysicsFormula[];
  steps: SolutionStep[];

  // Respuestas finales
  results: ExerciseResult[];

  // Visualización opcional
  visualization?: ExerciseVisualization;

  // Información adicional
  observations?: string[];
  references?: string[];
}

// --------------------------------------------------
// ESTRUCTURA DE LOS CAPÍTULOS
// --------------------------------------------------

export interface PhysicsChapterData {
  id: PhysicsChapter;
  title: string;
  subtitle: string;
  description: string;
  exercises: PhysicsExercise[];
}
