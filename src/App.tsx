import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Login } from './pages/login/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import NavBar from './components/navbar/NavBar';
import ModulosImpresion from './pages/impresion/modulosimpresion/ModulosImpresion';
import EtiquetadoBFX from './pages/impresion/etiquetadobfx/EtiquetadoBFX';
import EtiquetadoDestiny from './pages/impresion/etiquetadodestiny/EtiquetadoDestiny';
import EtiquetadoQuality from './pages/impresion/etiquetadoquality/EtiquetadoQuality';

const Entradas = () => <div>Entradas</div>;
const Salidas = () => <div>Salidas</div>;
const Ubicacion = () => <div>Ubicación</div>;
const Consultas = () => <div>Consultas</div>;
const Handheld = () => <div>Handheld</div>;
const Antenas = () => <div>Antenas</div>;
const Catalogos = () => <div>Catalogos</div>;
const Bioflex = () => <div>Bioflex</div>;
const Destiny = () => <div>Destiny</div>;
const Quality = () => <div>Quality</div>;

function App() {
  return (
    <Router>
      <div className="App">
        <div className='nav-bar'>
          <NavBar />
        </div>
        <div className="container-dashboard">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/salidas" element={<Salidas />} />
            <Route path="/ubicacion" element={<Ubicacion />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/handheld" element={<Handheld />} />
            <Route path="/antenas" element={<Antenas />} />
            <Route path="/catalogos" element={<Catalogos />} />
            <Route path="/bioflex" element={<Bioflex />} />
            <Route path="/destiny" element={<Destiny />} />
            <Route path="/quality" element={<Quality />} />
            <Route path="/modulosimpresion" element={<ModulosImpresion />} />
            <Route path="/impresionBFX" element={<EtiquetadoBFX />} />
            <Route path="/impresionDestiny" element={<EtiquetadoDestiny />} />
            <Route path="/impresionQuality" element={<EtiquetadoQuality />} /> {/* Nueva ruta para EtiquetadoQuality */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

