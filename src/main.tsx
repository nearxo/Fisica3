import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App';
import { HarmonicsPage } from './components/HarmonicsPage';
import './index.css'; // Tus estilos
import PhysicsExercisesPage  from "./components/PhysicsExercisesPage";
import { exampleExercise } from "./components/data/exampleExercise";
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal (tu app del oscilador) */}
        <Route path="/" element={<App />} />
        
        {/* Ruta de armónicos */}
        <Route path="/armonicos" element={<HarmonicsPage />} />
        <Route path="/ejercicios" element={<PhysicsExercisesPage  />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);