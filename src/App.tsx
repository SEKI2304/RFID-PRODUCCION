import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import { Dashboard } from './pages/dashboard/Dashboard';
import NavBar from './components/navbar/NavBar';
import EtiquetadoBFX_produccion from './pages/impresion produccion/etiquetadobfx_produccion/EtiquetadoBFX__produccion';
import EtiquetadoDestiny_produccion from './pages/impresion produccion/etiquetadodestiny_produccion/EtiquetadoDestiny_produccion';
import EtiquetadoQuality_produccion from './pages/impresion produccion/etiquetadoquality_produccion/EtiquetadoQuality_produccion';
import EtiquetadoVaso_produccion from './pages/impresion produccion/etiquetadoVaso_produccion/EtiquetadoVaso_produccion';
import ModulosImpresion_produccion from './pages/impresion produccion/modulosimpresion_produccion/ModulosImpresion_produccion';
import MoudulosConsultas from './pages/consultas/moduloconsultas/MoudulosConsultas';
import ConsultaBFX from './pages/consultas/consultasbfx/ConsultaBFX';
import ConsultaDestiny from './pages/consultas/consultasdestiny/ConsultaDestiny';
import ConsultaQuality from './pages/consultas/consultasquality/ConsultaQuality';
import ConsultaVaso from './pages/consultas/consultasvaso/ConsultaVaso';
import Etiquetado_WandW from './pages/impresion produccion/etiquetadoWandW_produccion/Etiquetado_WandW.tsx';
import ModulosImpresion_Quality from './pages/impresion produccion/modulosimpresion_quality/ModulosImpresion_quality';
import ModulosRegistros from './pages/registros/modulosregistros/ModulosRegistros';
import RegistroInsumos from './pages/registros/registroinsumos/RegistroInsumos';
import Etiquetado_HRSpinner from './pages/impresion produccion/etiquetadoHRSpinner_produccion/Etiquetado_HRSpinner';
import ReetiquetadoBobina from './pages/impresionmp/reentarimado-bobina/ReEntarimadoMP';

function App() {
  return (
    <Router>
      <div className="App">
        <div className='nav-bar'>
          <NavBar />
        </div>
        <div className="container-dashboard">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ModulosTarima" element={<ModulosImpresion_produccion />} />
            <Route path="/ImpresionTarimaBFX" element={<EtiquetadoBFX_produccion />} />
            <Route path="/ImpresionTarimaDestiny" element={<EtiquetadoDestiny_produccion />} />
            <Route path="/ImpresionTarimaQuality" element={<EtiquetadoQuality_produccion />} />
            <Route path="/ImpresionTarimaVaso" element={<EtiquetadoVaso_produccion />} />
            <Route path="/ImpresionTarimaW&W" element={<Etiquetado_WandW />} />
            <Route path="/ImpresionHRSpinner" element={<Etiquetado_HRSpinner />} />
            <Route path="/ModulosImpresionQuality" element={<ModulosImpresion_Quality />} />
            <Route path="/ModulosRegistros" element={<ModulosRegistros />} />
            <Route path="/Insumos" element={<RegistroInsumos/>} />
            <Route path="/Consultas" element={<MoudulosConsultas />} />
            <Route path="/ConsultaBFX" element={<ConsultaBFX />} />
            <Route path="/ConsultaDestiny" element={<ConsultaDestiny />} />
            <Route path="/ConsultaQuality" element={<ConsultaQuality />} />
            <Route path="/ConsultaVaso" element={<ConsultaVaso />} />
            <Route path="/Generacion-bobina" element={<ReetiquetadoBobina />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
