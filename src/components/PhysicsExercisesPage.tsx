
import React from "react";
import ExerciseContainer from "./Exercices/ExerciseContainer";
import { exampleExercise } from "./data/exampleExercise";
import { example17_5 } from "./data/chapter17";
import { SectionTitle } from "./SectionTitle";
import { Icon } from "./Icon";
import { Link } from "react-router";

  const navLinkStyle = {
    fontSize: "13px",
    padding: "6px 12px",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.05)",
    color: "inherit",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }

export default function PhysicsExercisesPage() {
  return (
    <div className="physics-exercises-page">
    <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Icon name="wave" size={22} />
          </span>
          <span>
            <strong>ONDULAB</strong>
            <small>Laboratorio de ondas</small>
          </span>
        </div>

        <div className="top-actions">
          <nav style={{ display: "flex", gap: "8px" }}>
            <Link to="/" title="Ir a Inicio" style={navLinkStyle}>
              Inicio
            </Link>
            <Link to="/harmonics" title="Ir a Síntesis Armónica" style={navLinkStyle}>
              Armonicos
            </Link>
            <Link to="/Ejercicios" title="Ir a Ejercicios" style={navLinkStyle}>
              Ejercicios
            </Link>
          </nav>

          
        </div>
      </header>
      <ExerciseContainer exercise={exampleExercise} />
      <ExerciseContainer exercise={example17_5} />
    </div>
  );
}
