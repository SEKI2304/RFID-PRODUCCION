import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import './etiquetadodestiny.scss';
import { Autocomplete } from '@mui/material';
import jsPDF from 'jspdf';

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

interface EtiquetaData {
  claveProducto: string;
  nombreProducto: string;
  pesoBruto: number;
  pesoNeto: number;
  orden: string;
  fecha: string;
}

interface InfoExtraDestiny {
    u_PO1: string;
    clave: string;
    producto: string;
    frgnName: string;
    u_ItemNo: string;
    u_PO2: string;
}


const EtiquetadoDestiny: React.FC = () => {
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
  const [date, setDate] = useState('');
const [resetKey, setResetKey] = useState(0);
  const [traceabilityCode, setTraceabilityCode] = useState('');
  const [selectedUOM, setSelectedUOM] = React.useState('');
  const [qtyUOM, setQtyUOM] = React.useState<string>("");
  const [shippingUnits, setShippingUnits] = React.useState<string>("");
  const [data, setData] = useState<InfoExtraDestiny[]>([]);
  const [inventoryLot, setInventoryLot] = useState<InfoExtraDestiny | null>(null);
  const [customerPO, setCustomerPO] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemNumber, setItemNumber] = useState<string>("");  

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
    const dateValue = event.target.value;

    // Construir un objeto Date que represente medianoche en la zona horaria local
      const dateParts = dateValue.split('-'); // asume formato yyyy-MM-dd
      if (dateParts.length === 3) {
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // los meses en JS son 0-indexados
          const day = parseInt(dateParts[2], 10);

          const localDate = new Date(year, month, day);

          // Formatear la fecha de vuelta a yyyy-MM-dd si es necesario
          // o usar localDate directamente si no necesitas pasar la fecha como cadena
          const formattedDate = localDate.toISOString().slice(0, 10);

          setDate(formattedDate);
      }
  };


  useEffect(() => {
    const generateTraceabilityCode = () => {
          const machine = filteredMaquinas.find(m => m.id === selectedMaquina);
          const machineCode = machine ? machine.no.padStart(2, '0') : '00';

          // Extrae los componentes de la fecha directamente de la cadena 'date'
          const year = date.slice(0, 4);
          const month = date.slice(5, 7);
          const day = date.slice(8, 10);

          const formattedDate = `${day}${month}${year.slice(-2)}`;
          const formattedNumeroTarima = numeroTarima.padStart(3, '0');

          const newTraceabilityCode = `${machineCode}${formattedDate}${formattedNumeroTarima}`;
          setTraceabilityCode(newTraceabilityCode);
      };

      generateTraceabilityCode();
  }, [selectedMaquina, date, numeroTarima, filteredMaquinas]);

  

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

  const resetForm = () => {
    setSelectedArea(undefined);
    setSelectedOrden(undefined);
    setSelectedMaquina(undefined);
    setSelectedTurno(undefined);
    setSelectedOperador(undefined);
    setPesoBruto(undefined);
    setPesoNeto(undefined);
    setPesoTarima(undefined);
    setPiezas(undefined);
    setNumeroTarima('');
    setSelectedUOM('');
    setDate('');
    setTraceabilityCode('');

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
  
    doc.setFontSize(50);
    doc.text(`LOTE:${orden}`, 20, 165);
    doc.text(`${fecha} `, 155, 165);
    
    doc.setFontSize(70);
    doc.text(`${pesoNeto} KGM`, 70, 200);
  
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(5, 55, 275, 55);
    doc.line(5, 145, 275, 145);
    doc.line(5, 175, 275, 175);
  
    window.open(doc.output('bloburl'), '_blank');
  };



  const handleConfirmEtiqueta = () => {
    const area = areas.find(a => a.id === selectedArea)?.area;
    const orden = ordenes.find(o => o.id === selectedOrden)?.orden.toString() ?? "";
    const maquina = filteredMaquinas.find(m => m.id === selectedMaquina)?.maquina;
    const producto = filteredProductos;
    const turno = turnos.find(t => t.id === selectedTurno)?.turno;
    const operadorSeleccionado = operadores.find(o => o.id === selectedOperador);

    // Asegúrate de que inventoryLot se envíe como una cadena, aquí un ejemplo:
    const inventoryLotString = inventoryLot ? inventoryLot.u_PO2 : ''; // Asumiendo que 'id' es el atributo que necesitas.

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
      uom: selectedUOM,
      fecha: date,
      postExtraDestinyDto: {
        shippingUnits: shippingUnits || 0,
        uom: selectedUOM || '',
        inventoryLot: inventoryLotString,
        individualUnits: qtyUOM || 0,
        palletId: traceabilityCode || '',
        customerPo: customerPO || '',
        totalUnits: piezas || 0,
        productDescription: itemDescription || '',
        itemNumber: itemNumber || ''
      }
    };

    axios.post('https://localhost:7204/Printer/SendSATOCommandProdExtrasDestiny', data)
    .then(response => {
      console.log('Etiqueta generada:', response.data);
      resetForm();
      handleCloseModal();
      generatePDF(data);
    })
    .catch(error => {
      console.error('Error generating etiqueta:', error);
      // Agregar manejo de error en la interfaz de usuario aquí.
    });
  };

  const calculatePieces = () => {
    const qtyNumber = parseFloat(qtyUOM) || 0;
    const unitsNumber = parseFloat(shippingUnits) || 0;
    setPiezas(qtyNumber * unitsNumber);
  };

  const handleQtyUOMChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQtyUOM(event.target.value);
    calculatePieces();
  };

  const handleShippingUnitsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShippingUnits(event.target.value);
    calculatePieces();
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
        const productoConcatenado = `${orden.claveProducto} + ${orden.producto}`;
        setFilteredProductos(productoConcatenado); // Correcto para una cadena simple
      }
    });
  }
}, [selectedArea, selectedOrden]);

  useEffect(() => {
    if (qtyUOM && shippingUnits) {
      const calculatedPieces = parseInt(qtyUOM) * parseInt(shippingUnits);
      setPiezas(calculatedPieces);
    }
  }, [qtyUOM, shippingUnits]);

  useEffect(() => {
        axios.get('https://localhost:7204/api/LabelDestiny/GetInfoExtraDestiny')
            .then(response => {
                setData(response.data);
            })
            .catch(error => console.error('Error fetching data: ', error));
    }, []);

    // Actualizar campos basados en la selección del lote de inventario
    useEffect(() => {
        if (inventoryLot) {
            setCustomerPO(inventoryLot.u_PO1 || " ");
            setItemDescription(inventoryLot.frgnName);
            setItemNumber(inventoryLot.u_ItemNo);
        }
    }, [inventoryLot]);

  // Definir el tipo para el objeto de mapeo.
  interface UOMMap {
    [key: number]: string;
  }

  const areaIdToUOM: UOMMap = {
    3: 'ROLLS', // ID correspondiente a REFILADO
    4: 'CASES', // ID correspondiente a BOLSEO
    6: 'BAGS'   // ID correspondiente a POUCH
  };

  useEffect(() => {
    if (selectedArea) {
      const uom = areaIdToUOM[selectedArea] || ''; // Usamos el ID del área directamente
      setSelectedUOM(uom);
    }
  }, [selectedArea]);




  return (
    <div className='impresion-container-destiny'>
      <IconButton
        onClick={() => navigate('/modulosimpresion')}
        sx={{ position: 'absolute', top: 16, left: 16 }}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box className='impresion-card-destiny'>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          GENERACION ETIQUETA FORMATO DESTINY
        </Typography>
        <Box className='impresion-form-destiny' >
        <TextField
        type="date"
        value={date}
        onChange={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}/>
          <Autocomplete
              key={`area-${resetKey}`}
              value={areas.find(area => area.id === selectedArea)}
              onChange={(event, newValue) => setSelectedArea(newValue?.id)}
              options={areas}
              getOptionLabel={(option) => option.area}
              renderInput={(params) => <TextField {...params} label="Área" fullWidth />}
          />
          <Autocomplete
              key={`orden-${resetKey}`}
              value={ordenes.find(o => o.id === selectedOrden)}
              onChange={(event, newValue) => setSelectedOrden(newValue?.id)}
              options={ordenes}
              getOptionLabel={(option) => option.orden.toString() + " - " + option.claveProducto + option.producto}
              renderInput={(params) => <TextField {...params} label="Orden" />}
          />
          <Autocomplete
              key={`maquina-${resetKey}`}
              value={filteredMaquinas.find(m => m.id === selectedMaquina)}
              onChange={(event, newValue) => setSelectedMaquina(newValue?.id)}
              options={filteredMaquinas}
              getOptionLabel={(option) => option.maquina}
              renderInput={(params) => <TextField {...params} label="Máquina" />}
          />
          <TextField
              key={`producto-${resetKey}`}
              fullWidth
              label="Producto"
              value={filteredProductos}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
          />
            <Autocomplete
                key={`turno-${resetKey}`}
                value={turnos.find(t => t.id === selectedTurno)}
                onChange={(event, newValue) => setSelectedTurno(newValue?.id)}
                options={turnos}
                getOptionLabel={(option) => option.turno}
                renderInput={(params) => <TextField {...params} label="Turno" />}
            />

            <Autocomplete
                key={`operador-${resetKey}`}
                value={operadores.find(o => o.id === selectedOperador)}
                onChange={(event, newValue) => setSelectedOperador(newValue?.id)}
                options={operadores}
                getOptionLabel={(option) => `${option.numNomina} - ${option.nombreCompleto}`}
                renderInput={(params) => <TextField {...params} label="Operador" />}
            />
          <TextField
              key={`peso-bruto-${resetKey}`}
              fullWidth
              label="PESO BRUTO"
              variant="outlined"
              type="number"
              value={pesoBruto}
              onChange={handlePesoBrutoChange}
          />

          <TextField
              key={`peso-neto-${resetKey}`}
              fullWidth
              label="PESO NETO"
              variant="outlined"
              type="number"
              value={pesoNeto}
              onChange={handlePesoNetoChange}
          />

          <TextField
              key={`peso-tarima-${resetKey}`}
              fullWidth
              label="PESO TARIMA"
              variant="outlined"
              type="number"
              value={pesoTarima}
              onChange={handlePesoTarimaChange}
          />
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
          <TextField
            fullWidth
            variant="outlined"
            type="number"
            value={piezas || 0} // Se muestra 0 si `piezas` es undefined
            InputProps={{ readOnly: true }}
          />

          <TextField fullWidth label="UOM" value={selectedUOM} InputProps={{ readOnly: true }} variant="outlined" />
            
          <Autocomplete
                value={inventoryLot}
                onChange={(event, newValue) => {
                    setInventoryLot(newValue);
                }}
                options={data}
                getOptionLabel={(option) => `${option.u_PO2} - ${option.clave} ${option.producto}`}
                renderInput={(params) => <TextField {...params} label="Inventory Lot" fullWidth />}
            />

          <TextField
            fullWidth
            label="Qty/UOM(Eaches)"
            variant="outlined"
            type="number"
            value={qtyUOM}
            onChange={handleQtyUOMChange}
          />
          <TextField
            fullWidth
            label="Pallet ID"
            variant="outlined"
            type="number"
            value={traceabilityCode} // Se muestra el Pallet ID generado
            InputProps={{ readOnly: true }} // Hace el campo de solo lectura si no requieres que sea editable
          />
          <TextField
            fullWidth
            label="Shipping Units/Pallet"
            variant="outlined"
            type="number"
            value={shippingUnits}
            onChange={handleShippingUnitsChange}
          />
          <TextField fullWidth label="Customer PO" variant="outlined" value={customerPO} InputProps={{ readOnly: true }} />
          <TextField fullWidth label="Item Description" variant="outlined" value={itemDescription} InputProps={{ readOnly: true }} />
          <TextField fullWidth label="Item#" variant="outlined" value={itemNumber} InputProps={{ readOnly: true }} />
        </Box>
        <Box className='impresion-button-destiny'>
          <Button variant="contained" className="generate-button" onClick={handleGenerateEtiqueta}>
            VISTA PREVIA
          </Button>
        </Box>
      </Box>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper className="modal-content destiny-modal-content">
          <Box className="modal-header">
            <Typography variant="h6">Vista Previa de la Etiqueta</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box className="modal-body">
            <Box className="modal-row">
              <Typography><strong>PALLET PLACARD</strong></Typography>
            </Box>
            <Box className="modal-row">
              <Typography><strong>SHIPPING UNITS/PALLET:</strong> {shippingUnits}</Typography>
              <Typography><strong>UOM:</strong> {selectedUOM}</Typography>
            </Box>
            <Box className="modal-row">
              <Typography>
                <strong>INVENTORY LOT:</strong> {inventoryLot ? inventoryLot.u_PO2 : 'N/A'}
              </Typography>

              <Typography><strong>QTY/UOM (EACHES):</strong> {qtyUOM}</Typography>
          </Box>
            <Box className="modal-row">
              <Typography><strong>PALLET ID:</strong> {traceabilityCode}</Typography>
              <Typography><strong>TOTAL QTY/PALLET (EACHES):</strong> {piezas}</Typography>
            </Box>
            <Box className="modal-row">
              <Typography><strong>CUSTOMER PO:</strong> {customerPO}</Typography>
            </Box>
            <Box className="modal-row">
              <Typography><strong>ITEM DESCRIPTION:</strong> {itemDescription}</Typography>
            </Box>
            <Box className="modal-row">
              <Typography><strong>ITEM#:</strong> {itemNumber}</Typography>
            </Box>
            <Box className="modal-row">
              <Typography><strong>GROSS WEIGHT:</strong> {pesoBruto}</Typography>
              <Typography><strong>NET WEIGHT:</strong> {pesoNeto}</Typography>
            </Box>
            <Box className="modal-row">
              <Typography><strong>Codigo de Trazabilidad:</strong> {trazabilidad}</Typography>
            </Box>
          </Box>
          <Box className="modal-footer">
            <Button variant="contained" color="primary" onClick={handleConfirmEtiqueta}>
              Confirmar e Imprimir
            </Button>
          </Box>
        </Paper>
      </Modal>
    </div>
  );
};

export default EtiquetadoDestiny;
