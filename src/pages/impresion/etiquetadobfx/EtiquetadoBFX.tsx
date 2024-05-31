import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './etiquetadobfx.scss';

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
    // Carga de operadores basada en la selección de área y turno
    if (selectedArea && selectedTurno) {
      axios.get<Operador[]>(`https://localhost:7204/api/Operator?IdArea=${selectedArea}&IdTurno=${selectedTurno}`)
        .then(response => {
          setOperadores(response.data);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [selectedArea, selectedTurno]);
  
  const handleGenerateEtiqueta = () => {
  const area = areas.find(a => a.id === selectedArea)?.area;
  const orden = ordenes.find(o => o.id === selectedOrden)?.orden;
  const maquina = filteredMaquinas.find(m => m.id === selectedMaquina)?.maquina;
  const producto = filteredProductos.join(', ');
  const turno = turnos.find(t => t.id === selectedTurno)?.turno;
  const operador = operadores.find(o => o.id === selectedTurno)?.nombreCompleto;

  console.log(area);
  console.log(orden);
  console.log(pesoNeto);
  
  // Datos a enviar a la API
  const data = {
    area: area || '',
    claveProducto: producto.split(' ')[0],
    nombreProducto: producto.split(' ').slice(1).join(' '),
    claveOperador: '',
    operador: operador || '',
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
            {filteredProductos.map((producto, index) => (
              <MenuItem key={index} value={producto}>{producto}</MenuItem>
            ))}
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
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>Operador</MenuItem>
            {operadores.map(operador => (
              <MenuItem key={operador.id} value={operador.id}>{operador.nombreCompleto}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="PESO BRUTO" variant="outlined" type="number" value={pesoBruto} onChange={e => setPesoBruto(parseFloat(e.target.value))} />
          <TextField fullWidth label="PESO NETO" variant="outlined" type="number" value={pesoNeto} onChange={e => setPesoNeto(parseFloat(e.target.value))} />
          <TextField fullWidth label="PESO TARIMA" variant="outlined" type="number" value={pesoTarima} onChange={e => setPesoTarima(parseFloat(e.target.value))} />
          <TextField fullWidth label="# Piezas (Rollos, Bultos, Cajas)" variant="outlined" type="number" value={piezas} onChange={e => setPiezas(parseFloat(e.target.value))} />
        </Box>
        <Box className='impresion-button-bfx'>
          <Button variant="contained" className="generate-button" onClick={handleGenerateEtiqueta}>
            GENERAR ETIQUETA
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default EtiquetadoBFX;

