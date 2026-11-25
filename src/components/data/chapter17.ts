
import type { PhysicsExercise } from "../types/exercises";

export const example17_5: PhysicsExercise = {
  id: "example-17-5",
  number: "17.5",
  title: "El radio-reloj en caída libre",
  chapter: 17,
  type: "worked-example",
  category: "doppler",
  difficulty: "intermediate",

  statement:
    "Un radio-reloj emite continuamente un sonido de 600 Hz mientras cae desde una altura de 15.0 m. Una persona permanece en el punto desde el cual se soltó el objeto. Determina el tiempo de caída, la velocidad del radio-reloj justo antes de impactar y la frecuencia que escucha la persona en ese instante.",

  givenData: [
    {
      symbol: "f",
      name: "Frecuencia emitida",
      value: 600,
      unit: "Hz",
    },
    {
      symbol: "h",
      name: "Altura inicial",
      value: 15.0,
      unit: "m",
    },
    {
      symbol: "g",
      name: "Aceleración gravitacional",
      value: 9.8,
      unit: "m/s²",
    },
    {
      symbol: "v",
      name: "Rapidez del sonido en el aire",
      value: 343,
      unit: "m/s",
    },
  ],

  unknowns: [
    {
      symbol: "t",
      name: "Tiempo de caída",
      value: "?",
      unit: "s",
    },
    {
      symbol: "v_s",
      name: "Velocidad del radio-reloj",
      value: "?",
      unit: "m/s",
    },
    {
      symbol: "f'",
      name: "Frecuencia percibida",
      value: "?",
      unit: "Hz",
    },
  ],

  formulas: [
    {
      id: "free-fall-time",
      name: "Tiempo de caída libre",
      expression: "h = \\frac{1}{2}gt^2",
      description:
        "Permite calcular cuánto tarda el objeto en recorrer la altura desde el reposo.",
      variables: ["h", "g", "t"],
    },
    {
      id: "free-fall-velocity",
      name: "Velocidad en caída libre",
      expression: "v_s = gt",
      description:
        "Calcula la rapidez alcanzada por el objeto después del tiempo de caída.",
      variables: ["v_s", "g", "t"],
    },
    {
      id: "doppler-receding",
      name: "Efecto Doppler: fuente alejándose",
      expression: "f' = f\\frac{v}{v+v_s}",
      description:
        "La frecuencia percibida disminuye porque la fuente sonora se aleja del observador.",
      variables: ["f'", "f", "v", "v_s"],
    },
  ],

  steps: [
    {
      id: "step-1",
      title: "Identificar el movimiento",
      type: "analysis",
      explanation:
        "El radio-reloj se suelta desde el reposo y cae bajo la acción de la gravedad. La persona permanece en el punto de lanzamiento. Por tanto, justo antes del impacto, la fuente sonora se está alejando del observador.",
    },
    {
      id: "step-2",
      title: "Calcular el tiempo de caída",
      type: "formula",
      explanation:
        "Utilizamos la ecuación de posición para un objeto que parte del reposo en caída libre. Despejamos el tiempo.",
      equation: "h = \\frac{1}{2}gt^2",
      calculation:
        "t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(15.0)}{9.8}}",
      result: "t \\approx 1.75",
      unit: "s",
    },
    {
      id: "step-3",
      title: "Determinar la velocidad de la fuente",
      type: "calculation",
      explanation:
        "Con el tiempo calculado, obtenemos la rapidez del radio-reloj justo antes de llegar al suelo.",
      equation: "v_s = gt",
      calculation: "v_s = 9.8(1.75)",
      result: "v_s \\approx 17.2",
      unit: "m/s",
    },
    {
      id: "step-4",
      title: "Aplicar el efecto Doppler",
      type: "formula",
      explanation:
        "Como la fuente se aleja de la persona, utilizamos el signo positivo en el denominador. La velocidad del sonido es mucho mayor que la velocidad de la fuente.",
      equation: "f' = f\\frac{v}{v+v_s}",
      calculation:
        "f' = 600\\frac{343}{343+17.2}",
      result: "f' \\approx 571",
      unit: "Hz",
    },
    {
      id: "step-5",
      title: "Interpretar el resultado",
      type: "interpretation",
      explanation:
        "La persona escucha una frecuencia menor que la emitida originalmente. Esto sucede porque el radio-reloj se aleja mientras produce el sonido. La diferencia entre ambas frecuencias es consecuencia del efecto Doppler.",
      equation: "\\Delta f = f-f'",
      calculation: "\\Delta f = 600-571",
      result: "\\Delta f \\approx 29",
      unit: "Hz",
    },
  ],

  results: [
    {
      symbol: "t",
      label: "Tiempo de caída",
      value: 1.75,
      unit: "s",
      description: "Tiempo transcurrido desde que se suelta el radio-reloj.",
    },
    {
      symbol: "v_s",
      label: "Velocidad justo antes del impacto",
      value: 17.2,
      unit: "m/s",
      description: "Rapidez de la fuente sonora alejándose del observador.",
    },
    {
      symbol: "f'",
      label: "Frecuencia percibida",
      value: 571,
      unit: "Hz",
      description: "Frecuencia que escucha la persona en el punto de lanzamiento.",
    },
  ],

  visualization: {
    type: "doppler",
    title: "Fuente sonora en caída libre",
    description:
      "Representación del radio-reloj descendiendo mientras se aleja del observador situado en el punto inicial.",
    parameters: {
      initialHeight: 15,
      initialFrequency: 600,
      sourceVelocity: 17.2,
      observedFrequency: 571,
    },
  },

  observations: [
    "La frecuencia percibida es menor porque la fuente se aleja del observador.",
    "La velocidad de la fuente se calcula mediante las ecuaciones de caída libre.",
    "La velocidad del sonido se considera constante e igual a 343 m/s.",
    "Los resultados están redondeados a tres cifras significativas.",
  ],

  references: ["Capítulo 17", "Ejemplo 17.5"],
};
