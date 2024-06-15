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
  customerPO?: string;
  itemDescription?: string;
  itemNumber?: string;
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
  /*const [currentDate, setCurrentDate] = useState<string>('');*/
  const [trazabilidad, setTrazabilidad] = useState<string>('');
  const [rfid, setRfid] = useState<string>('');
  const [numeroTarima, setNumeroTarima] = useState('');
  const [unidad, setUnidad] = useState('Piezas');
  const [date, setDate] = useState('');
  
  const handlePesoBrutoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const newPesoBruto = parseFloat(event.target.value);
    // Verifica que el nuevo peso bruto no sea menor que el peso neto existente.
    if (!isNaN(newPesoBruto) && (pesoNeto === undefined || newPesoBruto >= pesoNeto)) {
      setPesoBruto(newPesoBruto);
    } else {
      // Opcional: Manejo de errores o alertas aquí.
      console.error('El peso bruto no puede ser menor que el peso neto.');
    }
  };

  const handlePesoNetoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPesoNeto = parseFloat(event.target.value);
    // Verifica que el nuevo peso neto no sea mayor que el peso bruto existente.
    if (!isNaN(newPesoNeto) && (pesoBruto === undefined || newPesoNeto <= pesoBruto)) {
      setPesoNeto(newPesoNeto);
    } else {
      // Opcional: Manejo de errores o alertas aquí.
      console.error('El peso neto no puede ser mayor que el peso bruto.');
    }
  };

  const handlePesoTarimaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = parseFloat(event.target.value);
    if (!isNaN(value) && value <= 30) {
      setPesoTarima(value);
    } else {
      console.error('El valor no puede ser mayor que 30.');
      // Aquí puedes elegir restablecer el valor al máximo permitido o simplemente ignorar la entrada.
      setPesoTarima(Math.min(value, 30));
    }
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Assuming you want to keep the date in 'yyyy-MM-dd' format in the state
    setDate(event.target.value);
  };

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
      const areaName = areas.find(a => a.id === selectedArea)?.area ;
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
    if (selectedArea) {
      axios.get<Operador[]>(`https://localhost:7204/api/Operator?IdArea=${selectedArea}`)
        .then(response => {
          setOperadores(response.data);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [selectedArea]);

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
    {/*const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);*/}
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
      'VASO': '5',
      'POUCH': '6',
      'LAMINADO 1': '7',
      'CINTA': '8',
      'DIGITAL': '9',
    };

    const selectedAreaName = areas.find(a => a.id === selectedArea)?.area || '';
    let areaCode = areaMap[selectedAreaName] || '0';
    const maquinaNo = filteredMaquinas.find(m => m.id === selectedMaquina)?.no;
    const maquinaCode = maquinaNo ? maquinaNo.toString().padStart(2, '0') : '00';
    const ordenNo = ordenes.find(o => o.id === selectedOrden)?.orden;
    const ordenCode = ordenNo ? ordenNo.toString().padStart(6, '0') : '000000';

    // Rellenando el número de tarima a tres dígitos
    const formattedNumeroTarima = numeroTarima.padStart(3, '0');

    const fullTrazabilidad = `${base}${areaCode}${maquinaCode}${ordenCode}${formattedNumeroTarima}`;
    setTrazabilidad(fullTrazabilidad);
    setRfid(`000${fullTrazabilidad}`);

    // Aquí puedes añadir tu lógica para enviar los datos al servidor o API
      {/*  try {
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
      }*/}
  };

  const handleConfirmEtiqueta = () => {
    const area = areas.find(a => a.id === selectedArea)?.area;
    const orden = ordenes.find(o => o.id === selectedOrden)?.orden.toString() ?? "";
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
      orden: orden || "",
      rfid: rfid,
      status: 1,
      uom: unidad,
      fecha: date
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
        <TextField
        type="date"
        value={date}
        onChange={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}
         />
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
            getOptionLabel={(option) => option.orden.toString() + " - " + option.claveProducto + option.producto}
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
          <TextField
            fullWidth
            label="PESO BRUTO"
            variant="outlined"
            type="number"
            value={pesoBruto}
            onChange={handlePesoBrutoChange} // Usar el nuevo método aquí
          />

          <TextField
            fullWidth
            label="PESO NETO"
            variant="outlined"
            type="number"
            value={pesoNeto}
            onChange={handlePesoNetoChange} // Usar el nuevo método aquí
          />
          <TextField
            fullWidth
            label="PESO TARIMA"
            variant="outlined"
            type="number"
            value={pesoTarima}
            onChange={handlePesoTarimaChange}
          />
          <TextField fullWidth label="# Piezas (Rollos, Bultos, Cajas)" variant="outlined" type="number" value={piezas} onChange={e => setPiezas(parseFloat(e.target.value))} />
          <TextField
              label="Número de Tarima"
              value={numeroTarima}
              onChange={(e) => {
                const value = e.target.value;
                // Acepta solo números y limita a 3 caracteres.
                if (/^\d{0,3}$/.test(value)) {
                  setNumeroTarima(value);
                }
              }}
          />
          <Select
            label="Unidad"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="Piezas">Piezas</MenuItem>
            <MenuItem value="Bultos">Bultos</MenuItem>
            <MenuItem value="Millares">Millares</MenuItem>
            <MenuItem value="Cajas">Cajas</MenuItem>
          </Select>
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
            <Typography>
              <strong>Fecha:</strong> {date}
            </Typography>
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
              <Typography><strong>{unidad}:</strong> {piezas}</Typography>
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