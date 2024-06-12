import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import './etiquetadobfx.scss';
import EtiquetaImpresion from '../../../assets/EiquetBFX.jpg';
import { Autocomplete } from '@mui/material';

interface Area {
  id: number;
  area: string;
}

interface Maquina {
  id: number;
  maquina: string;
  area: number;
  no: string;
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
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [filteredMaquinas, setFilteredMaquinas] = useState<Maquina[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<string>('');
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
  const [trazabilidad, setTrazabilidad] = useState<string>('');
  const [rfid, setRfid] = useState<string>('');
  

  useEffect(() => {
    axios.get<Area[]>('https://localhost:7204/api/Area').then(response => {
      setAreas(response.data);
    });
    axios.get<Turno[]>('https://localhost:7204/api/Turn').then(response => {
      setTurnos(response.data);
    });
  }, []);

  useEffect(() => {
    if (selectedArea) {
      const areaName = areas.find(a => a.id === selectedArea)?.area;
      axios.get<Orden[]>(`https://localhost:7204/api/Order/${areaName}`).then(response => {
        setOrdenes(response.data);
      });

      axios.get<Maquina[]>(`https://localhost:7204/api/Machine/${selectedArea}`)
        .then(response => {
          setFilteredMaquinas(response.data);
        })
        .catch(error => {
          console.error('Error fetching machines for area ID:', selectedArea, error);
          setFilteredMaquinas([]); // Limpia las máquinas si hay un error
        });
    } else {
      setOrdenes([]);
      setFilteredMaquinas([]);
    }
  }, [selectedArea, areas]);

  useEffect(() => {
    if (selectedArea && selectedTurno) {
      axios.get<Operador[]>(`https://localhost:7204/api/Operator?IdArea=${selectedArea}&IdTurno=${selectedTurno}`)
        .then(response => {
          setOperadores(response.data);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [selectedArea, selectedTurno]);

  useEffect(() => {
  if (selectedArea && selectedOrden) {
    axios.get<Orden[]>(`https://localhost:7204/api/Order?areaId=${selectedArea}`).then(response => {
      const orden = response.data.find(orden => orden.id === selectedOrden);
      if (orden) {
        const productoConcatenado = `${orden.claveProducto} ${orden.producto}`;
        setFilteredProductos(productoConcatenado); // Correcto para una cadena simple
      }
    });
  }
}, [selectedArea, selectedOrden]);
  

  const handleOpenModal = () => {
    const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);
    generateTrazabilidad(); // Generar trazabilidad y RFID antes de abrir el modal
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleGenerateEtiqueta = () => {
    handleOpenModal();
  };

  const generateTrazabilidad = async () => {
    const base = '2';
    const areaMap: { [key: string]: string } = {
      'EXTRUSIÓN': '1',
      'IMPRESIÓN': '2',
      'REFILADO': '3',
      'BOLSEO': '4',
      'POUCH': '5',
      'LAMINADO 1': '6'
    };

    const selectedAreaName = areas.find(a => a.id === selectedArea)?.area || '';
    let areaCode = areaMap[selectedAreaName] || '0';
    const maquinaNo = filteredMaquinas.find(m => m.id === selectedMaquina)?.no;
    const maquinaCode = maquinaNo ? maquinaNo.toString().padStart(2, '0') : '00';
    const ordenNo = ordenes.find(o => o.id === selectedOrden)?.orden;
    const ordenCode = ordenNo ? ordenNo.padStart(5, '0') : '00000';

    const partialTrazabilidad = `${base}${areaCode}${maquinaCode}${ordenCode}`;

    try {
      const response = await axios.get('https://localhost:7204/api/RfidLabel');
      const rfidLabels = response.data;

      const matchedLabels = rfidLabels.filter((label: { trazabilidad: string }) => label.trazabilidad.startsWith(partialTrazabilidad));
      const consecutivos = matchedLabels.map((label: { trazabilidad: string }) => parseInt(label.trazabilidad.slice(9)));
      const nextConsecutivo = consecutivos.length > 0 ? Math.max(...consecutivos) + 1 : 1;
      const consecutivoStr = nextConsecutivo.toString().padStart(3, '0');

      const fullTrazabilidad = `${partialTrazabilidad}${consecutivoStr}`;
      setTrazabilidad(fullTrazabilidad);
      setRfid(`0000${fullTrazabilidad}`);
    } catch (error) {
      console.error('Error fetching RfidLabel data:', error);
      setTrazabilidad(`${partialTrazabilidad}001`);
      setRfid(`0000${partialTrazabilidad}001`);
    }
  };

  const handleConfirmEtiqueta = () => {
    const area = areas.find(a => a.id === selectedArea)?.area;
    const orden = ordenes.find(o => o.id === selectedOrden)?.orden;
    const maquina = filteredMaquinas.find(m => m.id === selectedMaquina)?.maquina;
    const producto = filteredProductos; // Directamente asigna el valor sin usar .join()
    const turno = turnos.find(t => t.id === selectedTurno)?.turno;
    const operadorSeleccionado = operadores.find(o => o.id === selectedOperador);
    const data = {
      area: area || '',
      claveProducto: producto.split(' ')[0],
      nombreProducto: producto.split(' ').slice(1).join(' '),
      claveOperador: operadorSeleccionado ? operadorSeleccionado.numNomina : '',
      operador: operadorSeleccionado ? `${operadorSeleccionado.numNomina} - ${operadorSeleccionado.nombreCompleto}` : '',
      turno: turno || '',
      pesoTarima: pesoTarima || 0,
      pesoBruto: pesoBruto || 0,
      pesoNeto: pesoNeto || 0,
      piezas: piezas || 0,
      trazabilidad: trazabilidad,
      orden: orden || '',
      rfid: rfid,
      status: 1
    };

    axios.post('https://localhost:7204/Printer/SendSATOCommand', data)
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
          <Autocomplete
            value={areas.find(area => area.id === selectedArea)}
            onChange={(event, newValue) => setSelectedArea(newValue?.id)}
            options={areas}
            getOptionLabel={(option) => option.area}
            renderInput={(params) => <TextField {...params} label="Área" fullWidth />}
          />

          <Autocomplete
            value={ordenes.find(o => o.id === selectedOrden)}
            onChange={(event, newValue) => setSelectedOrden(newValue?.id)}
            options={ordenes}
            getOptionLabel={(option) => option.orden}
            renderInput={(params) => <TextField {...params} label="Orden" />}
          />
          <Autocomplete
              value={filteredMaquinas.find(m => m.id === selectedMaquina)}
              onChange={(event, newValue) => setSelectedMaquina(newValue?.id)}
              options={filteredMaquinas}
              getOptionLabel={(option) => option.maquina}
              renderInput={(params) => <TextField {...params} label="Máquina" />}
            />
          <TextField
              fullWidth
              label="Producto"
              value={filteredProductos} // Ahora es una string directa, no un array
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />

            <Autocomplete
              value={turnos.find(t => t.id === selectedTurno)}
              onChange={(event, newValue) => setSelectedTurno(newValue?.id)}
              options={turnos}
              getOptionLabel={(option) => option.turno}
              renderInput={(params) => <TextField {...params} label="Turno" />}
            />

            <Autocomplete
              value={operadores.find(o => o.id === selectedOperador)}
              onChange={(event, newValue) => setSelectedOperador(newValue?.id)}
              options={operadores}
              getOptionLabel={(option) => `${option.numNomina} - ${option.nombreCompleto}`}
              renderInput={(params) => <TextField {...params} label="Operador" />}
            />
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
        <Paper className="bfx-modal-content">
          <Box className="bfx-modal-header">
            <Typography variant="h6">Vista Previa de la Etiqueta</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box className="bfx-modal-body">
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
            <Typography><strong>Producto:</strong> {filteredProductos}</Typography>
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
              <Typography><strong>Operador:</strong> {operadores.find(o => o.id === selectedOperador)?.numNomina} - {operadores.find(o => o.id === selectedOperador)?.nombreCompleto}</Typography>
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
              <Typography><strong>Codigo de Trazabilidad:</strong> {trazabilidad}</Typography>
            </div>
            <div className="row">
              <Typography><strong>OT Y/O LOTE:</strong> {ordenes.find(o => o.id === selectedOrden)?.orden}</Typography>
            </div>
          </Box>
          <Box className="bfx-modal-footer">
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
