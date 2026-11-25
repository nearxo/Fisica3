
import type { PhysicsExercise } from "../types/exercises";

export const exampleExercise: PhysicsExercise = {
  id: "ch16-example-16-5",

  number: "16.5",
  title: "Potencia suministrada a una cuerda",

  chapter: 16,
  type: "worked-example",
  category: "wave-power",
  difficulty: "intermediate",

  statement:
    "Una cuerda tiene una densidad lineal de masa de 5.00 × 10⁻² kg/m y está sometida a una tensión de 80.0 N. A través de ella se transmite una onda sinusoidal con una frecuencia de 60.0 Hz y una amplitud de 6.00 cm. Determina la rapidez de propagación de la onda, su frecuencia angular y la potencia promedio transmitida.",

  givenData: [
    {
      symbol: "\\mu",
      name: "Densidad lineal de masa",
      value: "5.00 \\times 10^{-2}",
      unit: "kg/m",
      description: "Masa por unidad de longitud de la cuerda.",
    },
    {
      symbol: "T",
      name: "Tensión de la cuerda",
      value: "80.0",
      unit: "N",
    },
    {
      symbol: "f",
      name: "Frecuencia",
      value: "60.0",
      unit: "Hz",
    },
    {
      symbol: "A",
      name: "Amplitud",
      value: "6.00",
      unit: "cm",
      description: "Equivale a 0.0600 m en unidades del SI.",
    },
  ],

  unknowns: [
    {
      symbol: "v",
      name: "Rapidez de propagación",
      value: "?",
      unit: "m/s",
    },
    {
      symbol: "\\omega",
      name: "Frecuencia angular",
      value: "?",
      unit: "rad/s",
    },
    {
      symbol: "\\mathcal{P}_{prom}",
      name: "Potencia promedio",
      value: "?",
      unit: "W",
    },
  ],

  formulas: [
    {
      id: "wave-speed-string",
      name: "Rapidez de una onda en una cuerda",
      expression: "v=\\sqrt{\\frac{T}{\\mu}}",
      description:
        "Relaciona la tensión de la cuerda con su densidad lineal de masa.",
      variables: ["v", "T", "\\mu"],
    },
    {
      id: "angular-frequency",
      name: "Frecuencia angular",
      expression: "\\omega=2\\pi f",
      description:
        "Relaciona la frecuencia de oscilación con la frecuencia angular.",
      variables: ["\\omega", "f"],
    },
    {
      id: "average-power",
      name: "Potencia promedio transmitida",
      expression:
        "\\mathcal{P}_{prom}=\\frac{1}{2}\\mu v\\omega^2 A^2",
      description:
        "Determina la potencia promedio transportada por una onda sinusoidal en una cuerda.",
      variables: [
        "\\mu",
        "v",
        "\\omega",
        "A",
      ],
    },
  ],

  steps: [
    {
      id: "step-1",
      title: "Identificación del fenómeno físico",
      type: "analysis",
      explanation:
        "Tenemos una onda sinusoidal que se propaga por una cuerda sometida a tensión. La rapidez de propagación depende de las propiedades mecánicas de la cuerda, mientras que la potencia depende también de la amplitud y la frecuencia de oscilación.",
    },

    {
      id: "step-2",
      title: "Conversión de unidades al Sistema Internacional",
      type: "calculation",
      explanation:
        "Antes de realizar los cálculos, expresamos la amplitud en metros. La densidad lineal ya está expresada en kg/m.",
      equation: "A=6.00\\,\\mathrm{cm}",
      calculation:
        "A=6.00\\times10^{-2}=0.0600\\,\\mathrm{m}",
      result: "A=0.0600",
      unit: "m",
    },

    {
      id: "step-3",
      title: "Cálculo de la rapidez de propagación",
      type: "formula",
      explanation:
        "Para una onda transversal en una cuerda, utilizamos la relación entre tensión y densidad lineal.",
      equation: "v=\\sqrt{\\frac{T}{\\mu}}",
    },

    {
      id: "step-4",
      title: "Sustitución de los valores",
      type: "substitution",
      explanation:
        "Reemplazamos la tensión de 80.0 N y la densidad lineal de 0.0500 kg/m.",
      calculation:
        "v=\\sqrt{\\frac{80.0}{5.00\\times10^{-2}}}",
    },

    {
      id: "step-5",
      title: "Rapidez de la onda",
      type: "result",
      explanation:
        "Al resolver la raíz cuadrada obtenemos la rapidez con la que se transmite la perturbación a través de la cuerda.",
      equation:
        "v=\\sqrt{1600}=40.0",
      result: "v=40.0",
      unit: "m/s",
    },

    {
      id: "step-6",
      title: "Cálculo de la frecuencia angular",
      type: "formula",
      explanation:
        "La frecuencia angular representa la rapidez de variación de la fase de la onda. Se obtiene multiplicando la frecuencia por 2π.",
      equation: "\\omega=2\\pi f",
    },

    {
      id: "step-7",
      title: "Sustitución de la frecuencia",
      type: "substitution",
      explanation:
        "Utilizamos la frecuencia de oscilación de 60.0 Hz.",
      calculation:
        "\\omega=2\\pi(60.0)",
    },

    {
      id: "step-8",
      title: "Frecuencia angular obtenida",
      type: "result",
      explanation:
        "La frecuencia angular resultante describe la velocidad de oscilación de la fase de la onda.",
      equation:
        "\\omega=120\\pi\\approx376.99",
      result: "\\omega\\approx377",
      unit: "rad/s",
    },

    {
      id: "step-9",
      title: "Ecuación de potencia promedio",
      type: "formula",
      explanation:
        "La potencia promedio de una onda sinusoidal depende de la densidad lineal, la rapidez de propagación, el cuadrado de la frecuencia angular y el cuadrado de la amplitud.",
      equation:
        "\\mathcal{P}_{prom}=\\frac{1}{2}\\mu v\\omega^2 A^2",
    },

    {
      id: "step-10",
      title: "Sustitución de los valores",
      type: "substitution",
      explanation:
        "Incorporamos los valores obtenidos anteriormente y la amplitud convertida al Sistema Internacional.",
      calculation:
        "\\mathcal{P}_{prom}=\\frac{1}{2}(0.0500)(40.0)(377)^2(0.0600)^2",
    },

    {
      id: "step-11",
      title: "Cálculo de la potencia",
      type: "calculation",
      explanation:
        "Evaluamos las operaciones respetando el orden de las potencias y multiplicaciones.",
      calculation:
        "\\mathcal{P}_{prom}=\\frac{1}{2}(0.0500)(40.0)(142129)(0.0036)",
      result: "\\mathcal{P}_{prom}\\approx512",
      unit: "W",
    },
  ],

  results: [
    {
      symbol: "v",
      label: "Rapidez de propagación",
      value: 40.0,
      unit: "m/s",
      expression:
        "\\boxed{v=40.0\\,\\mathrm{m/s}}",
      description:
        "Rapidez de transmisión de la onda por la cuerda.",
    },
    {
      symbol: "\\omega",
      label: "Frecuencia angular",
      value: 377,
      unit: "rad/s",
      expression:
        "\\boxed{\\omega\\approx377\\,\\mathrm{rad/s}}",
      description:
        "Rapidez de variación de la fase de oscilación.",
    },
    {
      symbol: "\\mathcal{P}_{prom}",
      label: "Potencia promedio",
      value: 512,
      unit: "W",
      expression:
        "\\boxed{\\mathcal{P}_{prom}\\approx512\\,\\mathrm{W}}",
      description:
        "Potencia promedio transportada por la onda sinusoidal.",
    },
  ],

  observations: [
    "La rapidez de propagación depende de la tensión y de la densidad lineal de la cuerda. Si aumenta la tensión, la onda se propaga más rápidamente.",
    "La frecuencia angular está relacionada directamente con la frecuencia de oscilación. Una mayor frecuencia implica una variación más rápida de la fase.",
    "La potencia promedio es proporcional al cuadrado de la amplitud y al cuadrado de la frecuencia angular. Por ello, pequeños cambios en estas magnitudes pueden producir variaciones importantes en la energía transmitida.",
    "La potencia calculada corresponde al promedio temporal de la potencia transportada por la onda sinusoidal, no a su potencia instantánea.",
  ],

  visualization: {
    type: "wave",
    title: "Representación de la onda sinusoidal",
    description:
      "Representación conceptual de una perturbación transversal que se propaga a lo largo de una cuerda.",
    parameters: {
      amplitude: 0.06,
      frequency: 60,
      waveSpeed: 40,
      tension: 80,
    },
  },

  references: [
    "Capítulo 16: Movimiento ondulatorio.",
    "Ejemplo 16.5: Potencia suministrada a una cuerda.",
  ],
};
