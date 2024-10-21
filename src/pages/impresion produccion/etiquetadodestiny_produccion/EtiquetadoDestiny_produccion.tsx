import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import './etiquetadodestiny_produccion.scss';
import { Autocomplete } from '@mui/material';
import jsPDF from 'jspdf';
import bwipjs from 'bwip-js';
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles';

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
  claveUnidad:string;
}

interface EtiquetaData {
  claveProducto: string;
  nombreProducto: string;
  pesoBruto: number;
  pesoNeto: number;
  orden: string;
  fecha: string;
}

interface EtiquetaData2 {
  shippingUnits: number;
  uom: string;
  inventoryLot: string;
  traceabilityCode: string;
  customerPO: string;
  qtyUOM: number;
  piezas: number;
  itemDescription: string;
  itemNumber: string;
  pesoBruto: number;
  pesoNeto: number;
}

interface InfoExtraDestiny {
    u_PO1: string;
    clave: string;
    producto: string;
    frgnName: string;
    u_ItemNo: string;
    u_PO2: string;
}

interface Printer {
  name: string;
  ip: string;
}


interface RfidLabel {
  trazabilidad: string;
}



const EtiquetadoDestiny_produccion: React.FC = () => {
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
  const [date, setDate] = useState('');
const [resetKey, setResetKey] = useState(0);
  const [traceabilityCode, setTraceabilityCode] = useState('');
  const [selectedUOM, setSelectedUOM] = React.useState('');
  const [qtyUOM, setQtyUOM] = React.useState<string>("");
  const [shippingUnits, setShippingUnits] = React.useState<string>("");
  const [data, setData] = useState<InfoExtraDestiny[]>([]);
  const [inventoryLot, setInventoryLot] = useState<string>('');
  const [customerPO, setCustomerPO] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemNumber, setItemNumber] = useState<string>("");  
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [numeroTarimaGenerado, setNumeroTarimaGenerado] = useState('');
  const [claveUnidad, setClaveUnidad] = useState('Unidad');
  const [unidad, setUnidad] = useState('Piezas');
  const [piezasFormatted, setPiezasFormatted] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Swal.fire({
      icon: 'info',
      title: 'Información Importante',
      text: 'A partir de ahora, ya no será necesario ingresar el lote del cliente. La aplicación te lo brindará automáticamente. Solo necesitas la orden de producción. Los campos que se completarán automáticamente son: UOM, INVENTORY LOT, PALLET ID, CUSTOMER PO, ITEM DESCRIPTION, ITEM#.',
      confirmButtonText: 'Entendido',
    });
  }, []);

  const printerOptions = [
    { name: "Impresora 1", ip: "172.16.20.56" },
    { name: "Impresora 2", ip: "172.16.20.57" },
    { name: "Impresora 3", ip: "172.16.20.112" }
  ];

  const handlePesoTarimaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value >= 0 && value <= 52) {
      setPesoTarima(value);
    } else {
      console.error('El valor debe estar entre 0 y 52.');
      // Aquí puedes elegir restablecer el valor al mínimo permitido o simplemente ignorar la entrada.
      setPesoTarima(Math.max(Math.min(value, 52), 0));
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

  const handleOpenModal = () => {
    {/*const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);*/}
    generateBothCodes(); // Generar trazabilidad y RFID antes de abrir el modal
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  const handleGenerateEtiqueta = () => {
    // Verificamos que los pesos bruto y neto no sean iguales y manejen las otras condiciones
    if (pesoBruto !== undefined && pesoNeto !== undefined) {
        if (pesoBruto < pesoNeto) {
            Swal.fire({
                icon: 'error',
                title: 'Validación de Pesos',
                text: 'El peso bruto no puede ser menor que el peso neto.',
            });
            return; // Detiene la ejecución si la validación falla
        }

        if (pesoNeto > pesoBruto) {
            Swal.fire({
                icon: 'error',
                title: 'Validación de Pesos',
                text: 'El peso neto no puede ser mayor que el peso bruto.',
            });
            return; // Detiene la ejecución si la validación falla
        }

        if (pesoBruto === pesoNeto) {
            Swal.fire({
                icon: 'warning',
                title: 'Validación de Pesos Idénticos',
                text: 'El peso bruto y el peso neto no deben ser iguales.',
            });
            return; // Detiene la ejecución si los pesos son iguales
        }
    }

    // Si todas las validaciones pasan, entonces procede a generar la etiqueta
    handleOpenModal();
};


  const generateTrazabilidad = async () => {
    const base = '2';
    const areaMap: { [key: string]: string } = {
      'EXTRUSIÓN': '1', 'IMPRESIÓN': '2', 'REFILADO': '3', 'BOLSEO': '4',
      'VASO': '5', 'POUCH': '6', 'LAMINADO 1': '7', 'CINTA': '8', 'DIGITAL': '9',
    };

    const selectedAreaName = areas.find(a => a.id === selectedArea)?.area || '';
    const areaCode = areaMap[selectedAreaName as keyof typeof areaMap] || '0';
    const maquinaNo = filteredMaquinas.find(m => m.id === selectedMaquina)?.no || '00';
    const maquinaCode = maquinaNo.toString().padStart(2, '0');
    const ordenNo = ordenes.find(o => o.id === selectedOrden)?.orden || '000000';
    const ordenCode = ordenNo.toString().padStart(6, '0');
    const partialTrazabilidad = `${base}${areaCode}${maquinaCode}${ordenCode}`;

    try {
        const response = await axios.get<RfidLabel[]>('http://172.16.10.31/api/RfidLabel');
        const rfidLabels: RfidLabel[] = response.data;

        const matchedLabels = rfidLabels.filter((label: RfidLabel) => 
            label.trazabilidad.startsWith(partialTrazabilidad) && label.trazabilidad.length === 13
        );
        const consecutivos = matchedLabels.map((label: RfidLabel) => 
            parseInt(label.trazabilidad.slice(-3))
        );
        const nextConsecutivo = (consecutivos.length > 0 ? Math.max(...consecutivos) : 0) + 1;
        const consecutivoStr = nextConsecutivo.toString().padStart(3, '0');

        const fullTrazabilidad = `${partialTrazabilidad}${consecutivoStr}`;
        setTrazabilidad(fullTrazabilidad);
        setRfid(`000${fullTrazabilidad}`);

        return consecutivoStr; // Devuelve el valor de consecutivoStr
    } catch (error) {
        console.error('Error fetching RfidLabel data:', error);
        const defaultConsecutivo = '001';
        setTrazabilidad(`${partialTrazabilidad}${defaultConsecutivo}`);
        setRfid(`000${partialTrazabilidad}${defaultConsecutivo}`);

        return defaultConsecutivo; // Devuelve el valor por defecto
    }
};

const generateBothCodes = async () => {
    const consecutivoStr = await generateTrazabilidad();
    
    const machine = filteredMaquinas.find(m => m.id === selectedMaquina);
    const machineCode = machine ? machine.no.padStart(2, '0') : '00';

    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);

    const formattedDate = `${day}${month}${year.slice(-2)}`;
    const formattedNumeroTarima = consecutivoStr;

    const newTraceabilityCode = `${machineCode}${formattedDate}${formattedNumeroTarima}`;
    setTraceabilityCode(newTraceabilityCode);
};

const resetValores = () => {
  setSelectedArea(undefined);
  setSelectedTurno(undefined);
  setSelectedMaquina(undefined);
  setSelectedOrden(undefined);
  setPesoBruto(undefined);
  setPesoNeto(undefined);
  setPesoTarima(undefined);
  setPiezas(undefined);
  setSelectedOperador(undefined);
  setTrazabilidad('');
  setRfid('');
  setDate('');
  setFilteredProductos('');
  setTraceabilityCode('');
  setSelectedUOM('');
  setQtyUOM('');
  setShippingUnits('');
  setInventoryLot('');
  setCustomerPO('');
  setItemDescription('');
  setItemNumber('');
  setSelectedPrinter(null);
  setNumeroTarimaGenerado('');
  setClaveUnidad('Unidad');
  setUnidad('Piezas');
  setResetKey(prevKey => prevKey + 1);  // Incrementa la key para forzar rerender
};

  const resetForm = () => {
    setPesoBruto(undefined);
    setPesoNeto(undefined);
    setPesoTarima(undefined);
    setPiezas(undefined);
    setQtyUOM('');
    setShippingUnits('');
    setResetKey(prevKey => prevKey + 1);  // Incrementa la key para forzar rerender
  };

  const RedButton = styled(Button)({
    backgroundColor: 'red',
    color: 'white',
    '&:hover': {
      backgroundColor: 'darkred',
    },
  });
  

  const generatePDF = (data: EtiquetaData) => { //MODIFICAR ROTULO
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

    doc.text(`KGM`, 80, 180);

    doc.setFontSize(80);
    doc.text(`${pesoNeto}`, 5, 207);
    doc.text(`${piezasFormatted} ${claveUnidad}`, 122, 207);

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(5, 55, 275, 55);
    doc.line(5, 145, 275, 145);
    doc.line(5, 167, 275, 167);
    doc.line(117, 167, 117, 210);
    window.open(doc.output('bloburl'), '_blank');
  };

  const generatePDF2 = async (data: { shippingUnits?: number; uom?: string; inventoryLot?: string; traceabilityCode?: string; customerPO?: string; qtyUOM?: number; piezas?: number; itemDescription?: string; itemNumber?: string; pesoBruto: any; pesoNeto: any; postExtraDestinyDto?: any; }) => {
    const {
      postExtraDestinyDto: {
        shippingUnits,
        uom,
        inventoryLot,
        palletId: traceabilityCode,
        customerPo: customerPO,
        individualUnits: qtyUOM,
        totalUnits: piezas,
        productDescription: itemDescription,
        itemNumber,
      },
      pesoBruto,
      pesoNeto
    } = data;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "letter", // Puedes ajustar el tamaño de página según necesites
    });
    // Generar y agregar el código de barras para itemNumber
    const bwipjs = require('bwip-js');

    doc.setFontSize(40);
    doc.text(`PALLET CARD`, 20, 20);

    doc.setFontSize(10);
    doc.text(`Inventory lot:`, 7, 29);
    doc.text(`Pallet ID:`, 7, 49);
    doc.text(`Customer PO:`, 7, 74);
    doc.text(`ItemDescription:`, 7, 99);
    doc.text(`Item#:`, 7, 124);
    doc.text(`GROSS WEIGHT:`, 7, 175);
    doc.text(`Shipping Units/Pallet:`, 140, 9);
    doc.text(`UOM:`, 209, 9);
    doc.text(`QTY/UOM(Eaches):`, 140, 29);
    doc.text(`Total Qty/Pallet(Eaches):`, 140, 49);
    doc.text(`NET WEIGHT:`, 140, 175);

    doc.setFontSize(36);
    doc.text(`${inventoryLot}`, 7, 44);
    doc.text(`${traceabilityCode}`, 7, 69);
    doc.text(`${customerPO}`, 7, 94);
    doc.text(`${shippingUnits}`, 140, 24);
    doc.text(`${uom}`, 209, 24);
    doc.text(`${qtyUOM}`, 140, 44);

    doc.setFontSize(28);
    doc.text(`${itemDescription}`, 7, 119);
    
    doc.setFontSize(14);
    doc.text(`${itemNumber}`, 124, 167);
    doc.text(`${piezas}`, 205, 92);

    doc.setFontSize(90);
    doc.text(`${pesoBruto}`, 50, 209);
    doc.text(`${pesoNeto}`, 190, 209);

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(5, 5, 275, 5);
    doc.line(138, 5, 138, 95);
    doc.line(207, 5, 207, 25);
    doc.line(5, 5, 5, 210);
    doc.line(275, 5, 275, 210);
    doc.line(5, 25, 275, 25);
    doc.line(5, 45, 275, 45);
    doc.line(5, 70, 138, 70);
    doc.line(5, 95, 275, 95);
    doc.line(138, 170, 138, 210);
    doc.line(5, 120, 275, 120);
    doc.line(5, 170, 275, 170);
    doc.line(5, 210, 275, 210);

    try {
      const bwipjs = require('bwip-js');
      const canvasItem = document.createElement("canvas");
      await bwipjs.toCanvas(canvasItem, {
          bcid: 'code128',       // Barcode type
          text: itemNumber,      // Text to encode
          scale: 3,              // 3x scaling factor
          height: 10,            // Bar height, in millimeters
      });
      const itemNumberUrl = canvasItem.toDataURL("image/png");
      doc.addImage(itemNumberUrl, "PNG", 55, 130, 160, 30);
  
      const canvasTotal = document.createElement("canvas");
      await bwipjs.toCanvas(canvasTotal, {
          bcid: 'code128',               // Barcode type
          text: piezas.toString(),       // Text to encode
          scale: 3,                      // 3x scaling factor
          height: 10,                    // Bar height, in millimeters
      });
      const totalQtyPalletUrl = canvasTotal.toDataURL("image/png");
      doc.addImage(totalQtyPalletUrl, "PNG", 170, 55, 70, 30);
    } catch (error) {
        console.error("Error generating barcode:", error);
    }

    doc.save('rotulodestiny.pdf');
  
  };

  

  const handleConfirmEtiqueta = async () => {
    // Si ya se está procesando una solicitud, no hacemos nada.
    if (isSubmitting) return;

    if (!selectedPrinter) {
        Swal.fire({
            icon: 'warning',
            title: 'Impresora no seleccionada',
            text: 'Por favor, seleccione una impresora.',
        });
        return;
    }

    // Establecer el estado de envío para evitar clics múltiples
    setIsSubmitting(true);

    const url = `http://172.16.10.31/Printer/DestinyPrinterIP?ip=${selectedPrinter.ip}`;
    const area = areas.find(a => a.id === selectedArea)?.area || '';
    const orden = ordenes.find(o => o.id === selectedOrden)?.orden.toString() || '';
    const maquina = filteredMaquinas.find(m => m.id === selectedMaquina)?.maquina || '';
    const producto = filteredProductos || '';
    const turno = turnos.find(t => t.id === selectedTurno)?.turno || '';
    const operadorSeleccionado = operadores.find(o => o.id === selectedOperador);

    const data = {
        area: area,
        claveProducto: producto.split(' ')[0],
        nombreProducto: producto.split(' ').slice(1).join(' '),
        claveOperador: operadorSeleccionado ? operadorSeleccionado.numNomina : '',
        operador: operadorSeleccionado ? `${operadorSeleccionado.numNomina} - ${operadorSeleccionado.nombreCompleto}` : '',
        turno: turno,
        pesoTarima: pesoTarima !== undefined ? pesoTarima : '',
        pesoBruto: pesoBruto || 0,
        pesoNeto: pesoNeto || 0,
        piezas: piezas || 0,
        trazabilidad: trazabilidad || '',
        orden: orden,
        rfid: rfid || '',
        status: 1,
        uom: unidad || '',
        fecha: date || '',
        postExtraDestinyDto: {
            shippingUnits: shippingUnits || 0,
            uom: selectedUOM || '',
            inventoryLot: inventoryLot,
            individualUnits: qtyUOM || 0,
            palletId: traceabilityCode || '',
            customerPo: customerPO || '',
            totalUnits: piezas || 0,
            productDescription: itemDescription || '',
            itemNumber: itemNumber || ''
        }
    };

    // Validación de peso bruto y peso neto
    if (data.pesoBruto === 0 || data.pesoNeto === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Pesos inválidos',
            text: 'El peso bruto y el peso neto no pueden ser 0.',
        });
        setIsSubmitting(false); // Rehabilitar el botón
        return;
    }

    const requiredFields = [
        { name: 'Área', value: data.area },
        { name: 'Clave de Producto', value: data.claveProducto },
        { name: 'Nombre de Producto', value: data.nombreProducto },
        { name: 'Clave de Operador', value: data.claveOperador },
        { name: 'Operador', value: data.operador },
        { name: 'Turno', value: data.turno },
        { name: 'Peso Tarima', value: data.pesoTarima },
        { name: 'Peso Bruto', value: data.pesoBruto },
        { name: 'Peso Neto', value: data.pesoNeto },
        { name: 'Piezas', value: data.piezas },
        { name: 'Trazabilidad', value: data.trazabilidad },
        { name: 'Orden', value: data.orden },
        { name: 'RFID', value: data.rfid },
        { name: 'UOM', value: data.uom },
        { name: 'Fecha', value: data.fecha },
        { name: 'Shipping Units', value: data.postExtraDestinyDto.shippingUnits },
        { name: 'Selected UOM', value: data.postExtraDestinyDto.uom },
        { name: 'Inventory Lot', value: data.postExtraDestinyDto.inventoryLot },
        { name: 'Individual Units', value: data.postExtraDestinyDto.individualUnits },
        { name: 'Pallet ID', value: data.postExtraDestinyDto.palletId },
        { name: 'Customer PO', value: data.postExtraDestinyDto.customerPo },
        { name: 'Total Units', value: data.postExtraDestinyDto.totalUnits },
        { name: 'Product Description', value: data.postExtraDestinyDto.productDescription },
        { name: 'Item Number', value: data.postExtraDestinyDto.itemNumber }
    ];

    const emptyFields = requiredFields.filter(field => field.value === null || field.value === undefined || field.value === '');

    if (emptyFields.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: `Por favor, complete los siguientes campos: ${emptyFields.map(field => field.name).join(', ')}.`,
        });
        setIsSubmitting(false); // Rehabilitar el botón
        return;
    }

    try {
        const response = await axios.post(url, data);
        Swal.fire({
            icon: 'success',
            title: 'Etiqueta generada',
            text: 'La etiqueta se ha generado correctamente.',
        });
        resetForm();
        handleCloseModal();
        generatePDF(data);
        generatePDF2(data);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error al generar la etiqueta.',
        });
        console.error('Error al generar la etiqueta:', error);
    } finally {
        setIsSubmitting(false); // Rehabilitar el botón al finalizar el proceso
    }
};



const calculatePieces = (inputPiezas: string | number) => {
  // Convertir el valor a número
  const totalPiezas = parseFloat(inputPiezas.toString());

  // Establecer el valor de `piezas`
  setPiezas(totalPiezas);

  // Verificar si claveUnidad es "MIL" y formatear el valor si es necesario
  if (claveUnidad === 'MIL') {
    const formattedPiezas = (totalPiezas / 1000).toFixed(2);
    setPiezasFormatted(formattedPiezas);
  } else {
    setPiezasFormatted(totalPiezas.toString());
  }
};



const handleQtyUOMChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setQtyUOM(event.target.value);// Pasar el valor correcto
};

const handleShippingUnitsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setShippingUnits(event.target.value);
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
      const areaName = areas.find(a => a.id === selectedArea)?.area;
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
                setFilteredProductos(productoConcatenado);
                setUnidad(orden.unidad || "default_unit");

                const validKeys = ["MIL", "XBX", "H87"];
                const nuevaClaveUnidadLocal = validKeys.includes(orden.claveUnidad) ? orden.claveUnidad : "Pzas";
                setClaveUnidad(nuevaClaveUnidadLocal);

                // Usar el nuevo endpoint para obtener los datos adicionales
                axios.get<InfoExtraDestiny[]>(`http://172.16.10.31/api/LabelDestiny/GetInfoExtraDestinyByPedidoClave?pedido=${orden.orden}&clave=${orden.claveProducto}`)
                    .then((extraResponse) => {
                        const infoExtra = extraResponse.data[0]; // Asumiendo que solo te interesa el primer elemento del array
                        if (infoExtra) {
                            setCustomerPO(infoExtra.u_PO1 || " ");
                            setItemDescription(infoExtra.frgnName);
                            setItemNumber(infoExtra.u_ItemNo);
                            
                            // Establecer solo el valor de u_PO2 en el Inventory Lot
                            setInventoryLot(infoExtra.u_PO2 || '');
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching extra info:', error);
                    });
            }
        });
    }
}, [selectedArea, selectedOrden]);

  useEffect(() => {
        axios.get('http://172.16.10.31/api/LabelDestiny/GetInfoExtraDestiny')
            .then(response => {
                setData(response.data);
            })
            .catch(error => console.error('Error fetching data: ', error));
    }, []);

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
      <Box className='top-container-bfx'>
        <IconButton onClick={() => navigate('/ModulosTarima')} className='button-back'>
          <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
        </IconButton>
      </Box>
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
              getOptionLabel={(option) => option.orden.toString() + " - " + option.claveProducto + " " + option.producto}
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
              value={filteredProductos}
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
              key={`peso-bruto-${resetKey}`}
              fullWidth
              label="PESO BRUTO"
              variant="outlined"
              type="number"
              value={pesoBruto === undefined ? '' : pesoBruto}  // Asegúrate de manejar correctamente undefined
              onChange={(event) => setPesoBruto(event.target.value === '' ? undefined : parseFloat(event.target.value))}
          />

          <TextField
              key={`peso-neto-${resetKey}`}
              fullWidth
              label="PESO NETO"
              variant="outlined"
              type="number"
              value={pesoNeto === undefined ? '' : pesoNeto}  // Asegúrate de manejar correctamente undefined
              onChange={(event) => setPesoNeto(event.target.value === '' ? undefined : parseFloat(event.target.value))}
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
            key={`piezas-${resetKey}`}
            fullWidth
            label="TOTAL PIEZAS"
            variant="outlined"
            type="number"
            value={piezas} // Se muestra 0 si `piezas` es undefined
            onChange={(e) => calculatePieces(e.target.value)} // Aquí llamas a la función con el valor ingresado
          />
          <TextField fullWidth label="UOM" value={selectedUOM} InputProps={{ readOnly: true }} variant="outlined" key={`UOM-${resetKey}`}/>
          <TextField
            label="Inventory Lot"
            fullWidth
            value={inventoryLot} // Este valor se establece desde la API en el useEffect
            InputProps={{
              readOnly: true, // Hace que el campo sea solo de lectura
            }}
            variant="outlined"
          />
          <TextField
            key={`QTY/UOM(Eaches)-${resetKey}`}
            fullWidth
            label="CANTIDAD POR CAJAS/ROLLOS"
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
            key={`Shipping Units/Pallet-${resetKey}`}
            fullWidth
            label="CANTIDAD DE CAJAS O ROLLOS"
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
          <RedButton variant="contained" onClick={resetValores}>
            RESETEAR VALORES
          </RedButton>

          <Button variant="contained" className="generate-button" onClick={handleGenerateEtiqueta}>
            VISTA PREVIA
          </Button>
        </Box>
      </Box>
      <Modal open={openModal} onClose={handleCloseModal} style={{ zIndex: 1050 }}>
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
              <Typography><strong>INVENTORY LOT:</strong> {inventoryLot || 'N/A'}</Typography>
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
          <Autocomplete
              value={selectedPrinter}
              onChange={(event, newValue: Printer | null) => {
                setSelectedPrinter(newValue);  // Directly set the new value
              }}
              options={printerOptions} // Ensure printerOptions is of type Printer[]
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Printer" 
                  fullWidth 
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      height: '60px' // Ajusta la altura del campo de entrada
                    } 
                  }} 
                />
              )}
              sx={{ 
                width: '180px', // Ajusta el ancho del componente
                '& .MuiAutocomplete-inputRoot': { 
                  height: '60px' // Ajusta la altura del componente Autocomplete
                } 
              }}
            />
            <Button variant="contained" color="primary" onClick={handleConfirmEtiqueta}>
              Confirmar e Imprimir
            </Button>
          </Box>
        </Paper>
      </Modal>
    </div>
  );
};

export default EtiquetadoDestiny_produccion;
