import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import './etiquetadodestiny.scss';

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
  const [currentDate, setCurrentDate] = useState<string>('');
  const [trazabilidad, setTrazabilidad] = useState<string>('');
  const [rfid, setRfid] = useState<string>('');
  const [selectedUOM, setSelectedUOM] = React.useState('');
  const [inventoryLot, setInventoryLot] = React.useState<string>("");
  const [qtyUOM, setQtyUOM] = React.useState<string>("");
  const [palletID, setPalletID] = React.useState<string>("");
  const [shippingUnits, setShippingUnits] = React.useState<string>("");
  const [customerPO, setCustomerPO] = React.useState<string>("");
  const [itemDescription, setItemDescription] = React.useState<string>("");
  const [itemNumber, setItemNumber] = React.useState<string>("");
  const [bioFlexLabelId, setBioFlexLabelId] = useState<number | null>(null);

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

          // Set the related fields from the order
          setCustomerPO(orden.customerPO || "");
          setItemDescription(orden.itemDescription || "");
          setItemNumber(orden.itemNumber || "");
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

  // Definir el tipo para el objeto de mapeo.
  interface UOMMap {
    [key: number]: string;
  }

  const areaIdToUOM: UOMMap = {
    3: 'ROLLS', // ID correspondiente a REFILADO
    4: 'CASES', // ID correspondiente a BOLSEO
    5: 'BAGS'   // ID correspondiente a POUCH
  };

  React.useEffect(() => {
    if (selectedArea) {
      const uom = areaIdToUOM[selectedArea] || ''; // Usamos el ID del área directamente
      setSelectedUOM(uom);
    }
  }, [selectedArea]);

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
    const maquina = filteredMaquinas.find(m => m.id === selectedMaquina);
    const maquinaCode = maquina ? maquina.no.padStart(2, '0') : '00';
    const ordenNo = ordenes.find(o => o.id === selectedOrden)?.orden;
    const ordenCode = ordenNo ? ordenNo.padStart(5, '0') : '00000';
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear().toString().slice(2)}`;

    const partialTrazabilidad = `${base}${areaCode}${maquinaCode}${ordenCode}`;

    try {
      const response = await axios.get('https://localhost:7204/api/RfidLabel');
      const rfidLabels = response.data;
      const matchedLabels = rfidLabels.filter((label: { trazabilidad: string }) => label.trazabilidad.startsWith(partialTrazabilidad));
      const consecutivos = matchedLabels.map((label: { trazabilidad: string }) => parseInt(label.trazabilidad.slice(9)));
      const nextConsecutivo = consecutivos.length > 0 ? Math.max(...consecutivos) + 1 : 1;
      const consecutivoStr = nextConsecutivo.toString().padStart(2, '0');  // Ajusta a 2 dígitos para el Pallet ID

      const fullTrazabilidad = `${partialTrazabilidad}${consecutivoStr.padStart(3, '0')}`; // Asegúrate de que la trazabilidad usa 3 dígitos
      const palletId = `${maquinaCode}${formattedDate}${consecutivoStr}`; // Construye el Pallet ID

      setTrazabilidad(fullTrazabilidad);
      setRfid(`0000${fullTrazabilidad}`);
      setPalletID(palletId); // Guarda el Pallet ID generado

      // Set the bioFlexLabelId for later use
      if (response.data.length > 0) {
        setBioFlexLabelId(response.data[0].id);
      }
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
      status: 0,
      postExtraDestinyDto: {
        bioFlexLabelId: bioFlexLabelId, // Ajusta el ID del label generado
        shippingUnits: parseInt(shippingUnits),
        uom: selectedUOM,
        inventoryLot: inventoryLot,
        individualUnits: parseInt(qtyUOM),
        palletId: palletID,
        customerPo: customerPO,
        totalUnits: piezas || 0,
        productDescription: itemDescription,
        itemNumber: itemNumber
      }
    };

    axios.post('https://localhost:7204/api/LabelDestiny', data)
      .then(response => {
        console.log('Etiqueta generada:', response.data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error generating etiqueta:', error);
      });
  };

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
        <Box className='impresion-form-destiny'>
          <Select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value as number)}
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
          <TextField
            fullWidth
            label="Producto"
            value={filteredProductos} // Ahora es una string directa, no un array
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />

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
                {operador.numNomina} - {operador.nombreCompleto}
              </MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="PESO BRUTO" variant="outlined" type="number" value={pesoBruto} onChange={e => setPesoBruto(parseFloat(e.target.value))} />
          <TextField fullWidth label="PESO NETO" variant="outlined" type="number" value={pesoNeto} onChange={e => setPesoNeto(parseFloat(e.target.value))} />
          <TextField fullWidth label="PESO TARIMA" variant="outlined" type="number" value={pesoTarima} onChange={e => setPesoTarima(parseFloat(e.target.value))} />
          <TextField
            fullWidth
            variant="outlined"
            type="number"
            value={piezas || 0} // Se muestra 0 si `piezas` es undefined
            InputProps={{ readOnly: true }}
          />

          <TextField fullWidth label="UOM" value={selectedUOM} InputProps={{ readOnly: true }} variant="outlined" />
            
          <TextField fullWidth label="Inventory Lot" variant="outlined" type="number" InputProps={{ readOnly: true }} value={inventoryLot} onChange={(e) => setInventoryLot(e.target.value)} />
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
            value={palletID} // Se muestra el Pallet ID generado
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
              <Typography><strong>INVENTORY LOT:</strong> {inventoryLot}</Typography>
              <Typography><strong>QTY/UOM (EACHES):</strong> {qtyUOM}</Typography>
            </Box>
            <Box className="modal-row">
              <Typography><strong>PALLET ID:</strong> {palletID}</Typography>
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
