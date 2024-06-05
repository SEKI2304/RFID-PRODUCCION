import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper,  } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import './etiquetadobfx.scss';
import EtiquetaImpresion from '../../../assets/EiquetBFX.jpg';
interface Area {
  id: number;
  area: string;
}

interface Maquina {
  id: number;
  maquina: string;
  areaId: number;
}

interface Producto {
  claveProducto: string;
  producto: string;
}

interface Turno {
  id: number;
  turno: string;
}

interface Operador {
  id: number;
  nombreCompleto: string;
  numNomina: string;
}

interface Orden {
  id: number;
  orden: string;
  claveProducto: string;
  producto: string;
  areaId: number;
}

const EtiquetadoBFX: React.FC = () => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [productos, setProductos] = useState<Orden[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [filteredMaquinas, setFilteredMaquinas] = useState<Maquina[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | undefined>();
  const [selectedTurno, setSelectedTurno] = useState<number | undefined>();
  const [selectedMaquina, setSelectedMaquina] = useState<number | undefined>();
  const [selectedOrden, setSelectedOrden] = useState<number | undefined>();
  const [pesoBruto, setPesoBruto] = useState<number | undefined>();
  const [pesoNeto, setPesoNeto] = useState<number | undefined>();
  const [pesoTarima, setPesoTarima] = useState<number | undefined>();
  const [piezas, setPiezas] = useState<number | undefined>();
  const [selectedOperador, setSelectedOperador] = useState<number | undefined>();
  const [openModal, setOpenModal] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Carga inicial de áreas y turnos
    axios.get<Area[]>('https://localhost:7204/api/Area').then(response => {
      setAreas(response.data);
    });
    axios.get<Turno[]>('https://localhost:7204/api/Turn').then(response => {
      setTurnos(response.data);
    });
  }, []);

  useEffect(() => {
    if (selectedArea) {
      // Carga de órdenes basadas en el área seleccionada
      axios.get<Orden[]>(`https://localhost:7204/api/Order?areaId=${selectedArea}`).then(response => {
        setOrdenes(response.data);
      });
      // Carga de máquinas basadas en el área seleccionada
      axios.get<Maquina[]>(`https://localhost:7204/api/Machine?areaId=${selectedArea}`).then(response => {
        setFilteredMaquinas(response.data);
      });
    }
  }, [selectedArea]);

  useEffect(() => {
    if (selectedArea && selectedOrden) {
      // Carga de productos basados en el área y la orden seleccionada
      axios.get<Orden[]>(`https://localhost:7204/api/Order?areaId=${selectedArea}`).then(response => {
        const filtered = response.data.filter(orden => orden.id === selectedOrden);
        setFilteredProductos(filtered.map(orden => `${orden.claveProducto} ${orden.producto}`));
      });
    }
  }, [selectedArea, selectedOrden]);

  useEffect(() => {
    if (selectedArea && selectedTurno) {
      axios.get<Operador[]>(`https://localhost:7204/api/Operator?IdArea=${selectedArea}&IdTurno=${selectedTurno}`)
        .then(response => {
          setOperadores(response.data);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [selectedArea, selectedTurno]);

  const handleOpenModal = () => {
    const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleGenerateEtiqueta = () => {
    handleOpenModal();
  };

  const handleConfirmEtiqueta = () => {
    const area = areas.find(a => a.id === selectedArea)?.area;
    const orden = ordenes.find(o => o.id === selectedOrden)?.orden;
    const maquina = filteredMaquinas.find(m => m.id === selectedMaquina)?.maquina;
    const producto = filteredProductos.join(', ');
    const turno = turnos.find(t => t.id === selectedTurno)?.turno;
    const operadorSeleccionado = operadores.find(o => o.id === selectedOperador);

    console.log(area);
    console.log(orden);
    console.log(pesoNeto);

    // Datos a enviar a la API
    const data = {
      area: area || '',
      claveProducto: producto.split(' ')[0],
      nombreProducto: producto.split(' ').slice(1).join(' '),
      claveOperador: operadorSeleccionado ? operadorSeleccionado.id.toString() : '',
      operador: operadorSeleccionado ? operadorSeleccionado.nombreCompleto : '',
      turno: turno || '',
      pesoTarima: pesoTarima || 0,
      pesoBruto: pesoBruto || 0,
      pesoNeto: pesoNeto || 0,
      piezas: piezas || 0,
      trazabilidad: '',
      orden: orden || '',
      rfid: '',
      status: 0
    };

    // Realizar el POST a la API
    axios.post('https://localhost:7204/api/RfidLabel', data)
      .then(response => {
        console.log('Etiqueta generada:', response.data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error generating etiqueta:', error);
      });
  };

  return (
    <div className='impresion-container-bfx'>
      <IconButton onClick={() => navigate('/modulosimpresion')} sx={{ position: 'absolute', top: 16, left: 16 }}>
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box className='impresion-card-bfx'>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          GENERACION ETIQUETA FORMATO BFX
        </Typography>
        <Box className='impresion-form-bfx'>
          <Select
            value={selectedArea}
            onChange={e => setSelectedArea(e.target.value as number)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Área</MenuItem>
            {areas.map(area => (
              <MenuItem key={area.id} value={area.id}>{area.area}</MenuItem>
            ))}
          </Select>
          <Select
            value={selectedOrden}
            onChange={e => setSelectedOrden(e.target.value as number)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Orden</MenuItem>
            {ordenes.map(orden => (
              <MenuItem key={orden.id} value={orden.id}>{orden.orden}</MenuItem>
            ))}
          </Select>
          <Select
            value={selectedMaquina}
            onChange={e => setSelectedMaquina(e.target.value as number)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Máquina</MenuItem>
            {filteredMaquinas.map(maquina => (
              <MenuItem key={maquina.id} value={maquina.id}>{maquina.maquina}</MenuItem>
            ))}
          </Select>
          <Select
              displayEmpty
              fullWidth
            >
              <MenuItem value="" disabled>Producto</MenuItem>
              {filteredProductos.map((producto, index) => {
                const [claveProducto, ...rest] = producto.split(' ');
                const nombreProducto = rest.join(' ');
                return (
                  <MenuItem key={index} value={producto}>{claveProducto} - {nombreProducto}</MenuItem>
                );
              })}
            </Select>
          <Select
            value={selectedTurno}
            onChange={e => setSelectedTurno(e.target.value as number)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Turno</MenuItem>
            {turnos.map(turno => (
              <MenuItem key={turno.id} value={turno.id}>{turno.turno}</MenuItem>
            ))}
          </Select>
          <Select
            value={selectedOperador}
            onChange={(e) => setSelectedOperador(parseInt(e.target.value as string))}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Operador</MenuItem>
            {operadores.map((operador) => (
              <MenuItem key={operador.id} value={operador.id}>
                {operador.id} - {operador.nombreCompleto}
              </MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="PESO BRUTO" variant="outlined" type="number" value={pesoBruto} onChange={e => setPesoBruto(parseFloat(e.target.value))} />
          <TextField fullWidth label="PESO NETO" variant="outlined" type="number" value={pesoNeto} onChange={e => setPesoNeto(parseFloat(e.target.value))} />
          <TextField fullWidth label="PESO TARIMA" variant="outlined" type="number" value={pesoTarima} onChange={e => setPesoTarima(parseFloat(e.target.value))} />
          <TextField fullWidth label="# Piezas (Rollos, Bultos, Cajas)" variant="outlined" type="number" value={piezas} onChange={e => setPiezas(parseFloat(e.target.value))} />
        </Box>
        <Box className='impresion-button-bfx'>
          <Button variant="contained" className="generate-button" onClick={handleGenerateEtiqueta}>
              VISTA PREVIA
          </Button>
        </Box>
      </Box>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper className="modal-content">
          <Box className="modal-header">
            <Typography variant="h6">Vista Previa de la Etiqueta</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box className="modal-body">
            <div className="row">
              <img src={EtiquetaImpresion} alt="" className="img-etiquetado" />
            </div>
            <div className="row">
              <Typography><strong> PRODUCTO TERMINADO TARIMA</strong> </Typography>
            </div>
            <div className="row">
              <Typography><strong>Área:</strong> {areas.find(a => a.id === selectedArea)?.area}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Fecha:</strong> {currentDate}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Producto:</strong> {filteredProductos.join(', ')}</Typography>
            </div>
            <div className="row"></div>
            <div className="row">
              <Typography><strong>Orden:</strong> {ordenes.find(o => o.id === selectedOrden)?.orden}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Máquina:</strong> {filteredMaquinas.find(m => m.id === selectedMaquina)?.maquina}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Turno:</strong> {turnos.find(t => t.id === selectedTurno)?.turno}</Typography>
            </div>
            <div className="row">
            <Typography><strong>Operador:</strong> {operadores.find(o => o.id === selectedOperador)?.id} - {operadores.find(o => o.id === selectedOperador)?.nombreCompleto}</Typography>
          </div>

            <div className="row">
              <Typography><strong>Peso Bruto:</strong> {pesoBruto}</Typography>
            </div>
            <div className="row">
                            <Typography><strong>Peso Neto:</strong> {pesoNeto}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Peso Tarima:</strong> {pesoTarima}</Typography>
            </div>
            <div className="row">
              <Typography><strong># Piezas (Rollos, Bultos, Cajas):</strong> {piezas}</Typography>
            </div>
            <div className="row">
              <Typography><strong> Codigo de Trazabilidad: </strong> {piezas}</Typography>
            </div>
            <div className="row">
            <Typography><strong>OT Y/O LOTE:</strong> {ordenes.find(o => o.id === selectedOrden)?.orden}</Typography>
            </div>
          </Box>
          <Box className="modal-footer">
            <Button variant="contained" color="primary" onClick={handleConfirmEtiqueta}>
              Guardar e Imprimir
            </Button>
          </Box>
        </Paper>
      </Modal>
    </div>
  );
};

export default EtiquetadoBFX;
