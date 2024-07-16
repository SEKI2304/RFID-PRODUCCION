import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import './etiquetadovaso_produccion.scss';
import EtiquetaImpresion from '../../../assets/EiquetBFX.jpg';
import { Autocomplete } from '@mui/material';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';

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
  unidad: string;
}

interface EtiquetaData {
  claveProducto: string;
  nombreProducto: string;
  pesoBruto: number;
  pesoNeto: number;
  orden: string;
  fecha: string;
}


interface Printer {
  name: string;
  ip: string;
}

const EtiquetadoVaso_produccion: React.FC = () => {
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
  const [unidad, setUnidad] = useState('Piezas');
  const [date, setDate] = useState('');
  const [cantidadVasoPorCaja, setCantidadVasoPorCaja] = useState('');
  const [cantidadCajas, setCantidadCajas] = useState('');
  const [totalPiezas, setTotalPiezas] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);

  const printerOptions = [
    { name: "Impresora 1", ip: "172.16.20.56" },
    { name: "Impresora 2", ip: "172.16.20.57" }
  ];
  

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
    axios.get<Area[]>('http://172.16.10.31/api/Area').then(response => {
      setAreas(response.data);
    });
    axios.get<Turno[]>('http://172.16.10.31/api/Turn').then(response => {
      setTurnos(response.data);
    });
  }, []);

  useEffect(() => {
    if (selectedArea) {
      const areaName = areas.find(a => a.id === selectedArea)?.area ;
      axios.get<Orden[]>(`http://172.16.10.31/api/Order/${areaName}`).then(response => {
        setOrdenes(response.data);
      });

      axios.get<Maquina[]>(`http://172.16.10.31/api/Machine/${selectedArea}`)
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
      axios.get<Operador[]>(`http://172.16.10.31/api/Operator?IdArea=${selectedArea}`)
        .then(response => {
          setOperadores(response.data);
        })
        .catch(error => console.error('Error fetching data:', error));
    }
  }, [selectedArea]);

  useEffect(() => {
    if (selectedArea && selectedOrden) {
      axios.get<Orden[]>(`http://172.16.10.31/api/Order?areaId=${selectedArea}`).then(response => {
        const orden = response.data.find(orden => orden.id === selectedOrden);
        if (orden) {
          const productoConcatenado = `${orden.claveProducto} ${orden.producto}`;
          setFilteredProductos(productoConcatenado); // Establece el producto concatenado
          setUnidad(orden.unidad || "default_unit"); // Establece la unidad o una por defecto si no existe
        }
      });
    }
  }, [selectedArea, selectedOrden]);;

useEffect(() => {
  const vasoPorCaja = parseInt(cantidadVasoPorCaja, 10) || 0;
  const cajas = parseInt(cantidadCajas, 10) || 0;
  const total = vasoPorCaja * cajas;
  setTotalPiezas(total.toString()); // Convert number to string before setting the state
}, [cantidadVasoPorCaja, cantidadCajas]);

  

  const handleOpenModal = () => {
    {/*const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);*/}
    generateTrazabilidad(); // Generar trazabilidad y RFID antes de abrir el modal
    setOpenModal(true);
  };

  const resetForm = () => {
    setCantidadVasoPorCaja('');
    setCantidadCajas('');
    setTotalPiezas('');
    setPiezas(undefined);
    setUnidad('CAJAS');

    setResetKey(prevKey => prevKey + 1);  // Incrementa la key para forzar rerender
  };

  const generatePDF = (data: EtiquetaData) => {
    const { claveProducto, nombreProducto, pesoBruto, orden, fecha } = data;
  
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter'  // Puedes ajustar el tamaño de página según necesites
    });
  
    // Función para dividir y ajustar texto largo en varias líneas
    const splitText = (text: string, x: number, y: number, fontSize: number, maxWidth: number): number => {
      doc.setFontSize(fontSize);
      const lines: string[] = doc.splitTextToSize(text, maxWidth); // Divide el texto para que se ajuste al ancho máximo
      lines.forEach((line: string) => {  // Aquí se especifica el tipo de 'line' como 'string'
        doc.text(line, x, y);
        y += fontSize * 0.4; // Aumentar 'y' para la siguiente línea basada en el tamaño de la fuente
      });
      return y; // Retorna la nueva posición 'y' después de las líneas
    };
  
    doc.setFontSize(150);
    doc.text(`${claveProducto}`, 25, 45);

    let currentY = 80; // Inicio de la posición Y para 'Nombre del Producto'
    currentY = splitText(nombreProducto, 10, currentY, 45, 260); // Tamaño de fuente 60 y ancho máximo de 260mm

    doc.setFontSize(40);
    doc.text(`LOTE:${orden}`, 20, 161);
    doc.text(`${fecha} `, 155, 161);

    doc.setFontSize(72);
    doc.text(`${pesoNeto} KGM`, 5, 207);
    doc.text(`${piezas} ${unidad}`, 140, 207);

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(5, 55, 275, 55);
    doc.line(5, 145, 275, 145);
    doc.line(5, 167, 275, 167);
    doc.line(135, 167, 135, 210);
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleGenerateEtiqueta = () => {
    handleOpenModal();
  };

  const generateTrazabilidad = async () => {
    const base = '2';
    const areaMap: { [key: string]: string | undefined } = {
      'EXTRUSIÓN': '1', 'IMPRESIÓN': '2', 'REFILADO': '3', 'BOLSEO': '4',
      'VASO': '5', 'POUCH': '6', 'LAMINADO 1': '7', 'CINTA': '8', 'DIGITAL': '9',
    };

    const selectedAreaName = areas.find(a => a.id === selectedArea)?.area || '';
    const areaCode = areaMap[selectedAreaName] || '0';
    const maquinaNo = filteredMaquinas.find(m => m.id === selectedMaquina)?.no || '00';
    const maquinaCode = maquinaNo.toString().padStart(2, '0');
    const ordenNo = ordenes.find(o => o.id === selectedOrden)?.orden || '000000';
    const ordenCode = ordenNo.toString().padStart(6, '0');
    const partialTrazabilidad = `${base}${areaCode}${maquinaCode}${ordenCode}`;

    try {
        const response = await axios.get('http://172.16.10.31/api/RfidLabel');
        const rfidLabels = response.data;

        // Asegurar que solo consideramos los que tienen exactamente la longitud esperada
        const matchedLabels = rfidLabels.filter((label: { trazabilidad: string }) => 
            label.trazabilidad.startsWith(partialTrazabilidad) && label.trazabilidad.length === 13
        );
        const consecutivos = matchedLabels.map((label: { trazabilidad: string }) => 
            parseInt(label.trazabilidad.slice(-3))
        );
        const nextConsecutivo = (consecutivos.length > 0 ? Math.max(...consecutivos) : 0) + 1;
        const consecutivoStr = nextConsecutivo.toString().padStart(3, '0');

        const fullTrazabilidad = `${partialTrazabilidad}${consecutivoStr}`;
        setTrazabilidad(fullTrazabilidad);
        setRfid(`000${fullTrazabilidad}`);
    } catch (error) {
        console.error('Error fetching RfidLabel data:', error);
        setTrazabilidad(`${partialTrazabilidad}001`);
        setRfid(`000${partialTrazabilidad}001`);
    }
};

  const handleConfirmEtiqueta = () => {
    if (!selectedPrinter) {
      Swal.fire({
          icon: 'warning',
          title: 'Impresora no seleccionada',
          text: 'Por favor, seleccione una impresora.',
      });
      return;
  }
    const url = `http://172.16.10.31/api/Vaso/PostPrintVaso?ip=${selectedPrinter.ip}`;

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
      pesoTarima:0,
      pesoBruto:0,
      pesoNeto:0,
      piezas: 0,
      trazabilidad: trazabilidad,
      orden: orden || "",
      rfid: rfid,
      status: 1,
      uom: unidad,
      fecha: date,
      postExtraVasoDto: {
        amountPerBox: cantidadVasoPorCaja,
        boxes: cantidadCajas,
        totalAmount:totalPiezas, 
      }
    };

    const requiredFields = [
      { name: 'Área', value: data.area },
      { name: 'Clave de Producto', value: data.claveProducto },
      { name: 'Nombre de Producto', value: data.nombreProducto },
      { name: 'Clave de Operador', value: data.claveOperador },
      { name: 'Operador', value: data.operador },
      { name: 'Turno', value: data.turno },
      { name: 'Trazabilidad', value: data.trazabilidad },
      { name: 'Orden', value: data.orden },
      { name: 'RFID', value: data.rfid },
      { name: 'UOM', value: data.uom },
      { name: 'Fecha', value: data.fecha },
      { name: 'Cantidad por Caja', value: data.postExtraVasoDto.amountPerBox },
      { name: 'Cajas', value: data.postExtraVasoDto.boxes },
      { name: 'Cantidad Total', value: data.postExtraVasoDto.totalAmount }
  ];

    const emptyFields = requiredFields.filter(field => !field.value);

    if (emptyFields.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: `Por favor, complete los siguientes campos: ${emptyFields.map(field => field.name).join(', ')}.`,
        });
        return;
    }
  
      axios.post(url, data)
          .then(response => {
              Swal.fire({
                  icon: 'success',
                  title: 'Etiqueta generada',
                  text: 'La etiqueta se ha generado correctamente.',
              });
              resetForm();
              handleCloseModal();
              generatePDF(data);
          })
          .catch(error => {
              Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Hubo un error al generar la etiqueta.',
              });
              console.error('Error al generar la etiqueta:', error);
          });
};


  return (
    <div className='catalogo-bfx'>
      <Box className='top-container-bfx'>
        <IconButton onClick={() => navigate('/ModulosTarima')} className='button-back'>
          <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
        </IconButton>
      </Box>
      <Box className='impresion-card-bfx'>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          GENERACION ETIQUETA FORMATO IMPRESION VASO
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
            getOptionLabel={(option) => option.orden.toString() + " - " + option.claveProducto + " "+ option.producto}
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
            key={`cantvaso-${resetKey}`}
            fullWidth
            label="Cantidad Vaso Por Caja"
            variant="outlined"
            type="number"
            value={cantidadVasoPorCaja}
            onChange={e => setCantidadVasoPorCaja(e.target.value)}
          />

          <TextField
            key={`cantidadcajas-${resetKey}`}
            fullWidth
            label="Cantidad Cajas"
            variant="outlined"
            type="number"
            value={cantidadCajas}
            onChange={e => setCantidadCajas(e.target.value)}
          />

          <TextField
              fullWidth
              label="Total de Piezas"
              variant="outlined"
              type="number"
              value={totalPiezas}
              onChange={e => setTotalPiezas(e.target.value)}
              InputProps={{
                readOnly: true, // Hace el campo de sólo lectura
              }}
            />
          <TextField
              label="Unidad"
              value={unidad} // Utiliza la variable de estado `unidad`
              InputProps={{
                readOnly: true, 
              }}
              variant="outlined"
            />
        </Box>
        <Box className='impresion-button-bfx'>
          <Button variant="contained" className="generate-button" onClick={handleGenerateEtiqueta}>
            VISTA PREVIA
          </Button>
        </Box>
      </Box>
      <Modal open={openModal} onClose={handleCloseModal} style={{ zIndex: 1050 }}>
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
              <Typography><strong> PRODUCTO TERMINADO TARIMA VASO</strong> </Typography>
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
              <Typography><strong>Vaso por Caja:</strong> {cantidadVasoPorCaja}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Cajas:</strong> {cantidadCajas}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Piezas:</strong> {totalPiezas}</Typography>
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
            <Autocomplete
              value={selectedPrinter}
              onChange={(event, newValue: Printer | null) => {
                setSelectedPrinter(newValue);  // Directly set the new value
              }}
              options={printerOptions} // Ensure printerOptions is of type Printer[]
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="Printer" fullWidth />}
            />
            <Button variant="contained" color="primary" onClick={handleConfirmEtiqueta}>
              Guardar e Imprimir
            </Button>
          </Box>
        </Paper>
      </Modal>
    </div>
  );
}

export default EtiquetadoVaso_produccion;