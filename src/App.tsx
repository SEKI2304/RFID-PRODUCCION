import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import { Login } from './pages/login/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import NavBar from './components/navbar/NavBar';
import ModulosImpresion from './pages/impresion/modulosimpresion/ModulosImpresion';
import EtiquetadoBFX from './pages/impresion/etiquetadobfx/EtiquetadoBFX';
import EtiquetadoDestiny from './pages/impresion/etiquetadodestiny/EtiquetadoDestiny';
import EtiquetadoQuality from './pages/impresion/etiquetadoquality/EtiquetadoQuality';
import EtiquetadoVaso from './pages/impresion/etiquetadoVaso/EtiquetadoVaso';
import ModulosCatalogo from './pages/catalogo/moduloscatalgo/ModulosCatalogo';
import EtiquetadoBFX_produccion from './pages/impresion produccion/etiquetadobfx_produccion/EtiquetadoBFX__produccion';
import EtiquetadoDestiny_produccion from './pages/impresion produccion/etiquetadodestiny_produccion/EtiquetadoDestiny_produccion';
import EtiquetadoQuality_produccion from './pages/impresion produccion/etiquetadoquality_produccion/EtiquetadoQuality_produccion';
import EtiquetadoVaso_produccion from './pages/impresion produccion/etiquetadoVaso_produccion/EtiquetadoVaso_produccion';
import ModulosImpresion_produccion from './pages/impresion produccion/modulosimpresion_produccion/ModulosImpresion_produccion';
import ProductoBioflex from './pages/catalogo/catalogobfx/CatalogoBFX';
import ProductoDestiny from './pages/catalogo/catalogodestiny/CatalogoDestiny';
import Area from './pages/catalogo/catalogoarea/CatalogoArea';
import Maquina from './pages/catalogo/catalogomaquina/CatalogoMaquina';
import Operadores from './pages/catalogo/catalogooperador/CatalogoOperador';
import Turno from './pages/catalogo/catalogoturno/CatalgoTurno';
import Ordenes from './pages/catalogo/catalogoordenes/CatalogoOrdenes';
import ProductoQuality from './pages/catalogo/catalogoquality/CatalogoQuality';
import Footer from './components/footer/Footer';



const Entradas = () => <div>Entradas</div>;
const Salidas = () => <div>Salidas</div>;
const Ubicacion = () => <div>Ubicación</div>;
const Consultas = () => <div>Consultas</div>;
const Handheld = () => <div>Handheld</div>;
const Antenas = () => <div>Antenas</div>;

function App() {
  return (
    <Router>
      <div className="App">
        <div className='nav-bar'>
          <NavBar />
        </div>
        <div className="container-dashboard">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/salidas" element={<Salidas />} />
            <Route path="/ubicacion" element={<Ubicacion />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/handheld" element={<Handheld />} />
            <Route path="/antenas" element={<Antenas />} />
            <Route path="/catalogos" element={<ModulosCatalogo />} />
            <Route path="/catalogoBioflex" element={<ProductoBioflex />} />
            <Route path="/catalogoDestiny" element={<ProductoDestiny />} />
            <Route path="/catalogoQuality" element={<ProductoQuality />} />
            <Route path="/catalogoArea" element={<Area />} />
            <Route path="/catalogoMaquina" element={<Maquina />} />
            <Route path="/catalogoOperadores" element={<Operadores />} />
            <Route path="/catalogoTurno" element={<Turno />} />
            <Route path='/catalogoOrdenes' element={<Ordenes />}/>
            <Route path="/modulosimpresion" element={<ModulosImpresion />} />
            <Route path="/impresionBFX" element={<EtiquetadoBFX />} />
            <Route path="/impresionDestiny" element={<EtiquetadoDestiny />} />
            <Route path="/impresionQuality" element={<EtiquetadoQuality />} />
            <Route path="/impresionVaso" element={<EtiquetadoVaso />} />
            <Route path="/ModulosTarima" element={<ModulosImpresion_produccion />} />
            <Route path="/ImpresionTarimaBFX" element={<EtiquetadoBFX_produccion />} />
            <Route path="/ImpresionTarimaDestiny" element={<EtiquetadoDestiny_produccion />} />
            <Route path="/ImpresionTarimaQuality" element={<EtiquetadoQuality_produccion />} />
            <Route path="/ImpresionTarimaVaso" element={<EtiquetadoVaso_produccion />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
