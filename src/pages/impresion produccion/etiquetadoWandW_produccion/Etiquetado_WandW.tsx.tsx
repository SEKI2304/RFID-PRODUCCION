import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import './Etiquetado_WandW.scss';
import EtiquetaImpresion from '../../../../assets/EiquetBFX.jpg';
import { Autocomplete, createFilterOptions } from '@mui/material';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles';
import wandw from '../../../assets/w&w.png';

// Interfaces para definir la estructura de los datos utilizados en el componente.
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
  unidad: string;
  customerPO?: string;
  itemDescription?: string;
  itemNumber?: string;
  claveUnidad:string;
}
interface EtiquetaData {
  claveProducto: string;
  nombreProducto: string;
  pesoBruto: number;
  pesoNeto: number;
  orden: string;
  fecha: string;
  piezas: number;
}

interface Printer {
  name: string;
  ip: string;
}

interface RfidLabel {
  trazabilidad: string;
}

const Etiquetado_WandW: React.FC = () => {
  const navigate = useNavigate();
  // Estados para manejar los datos y opciones seleccionadas.
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
  const [resetKey, setResetKey] = useState(0);
  const [claveUnidad, setClaveUnidad] = useState('Unidad');
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [bagSize, setBagSize] = useState<string>('');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [itemNumber, setItemNumber] = useState<string>('');
  const [inventoryLot, setInventoryLot] = useState<number>(0);
  const [totalUnits, setTotalUnits] = useState<number>(0);
  const [traceabilityCode, setTraceabilityCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");
  // Aqui se asginan los nombres y las IP de las impresoras
  const printerOptions = [
    { name: "Impresora 1", ip: "172.16.20.56" },
    { name: "Impresora 2", ip: "172.16.20.57" },
  ];
  
  // Se utiliza para cargar las areas y turnos en cuanto se inicializa el componente
  useEffect(() => {
    axios.get<Area[]>('http://172.16.10.31/api/Area').then(response => {
      setAreas(response.data);
    });
    axios.get<Turno[]>('http://172.16.10.31/api/Turn').then(response => {
      setTurnos(response.data);
    });
  }, []);

  // Efecto para cargar las órdenes y máquinas disponibles según el área seleccionada.
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

  // Efecto para cargar los operadores según el área seleccionada.
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
  
          // Aplica la lógica para claveUnidad
          const validKeys = ["MIL", "XBX", "H87"];
          const nuevaClaveUnidadLocal = validKeys.includes(orden.claveUnidad) ? orden.claveUnidad : "Pzas";
          setClaveUnidad(nuevaClaveUnidadLocal);
  
          // Realiza la petición al endpoint InfoExtraQuality
          axios.get('http://172.16.10.31/api/InfoExtraQuality')
            .then(response => {
              // Filtrar la información basada en la clave y la orden seleccionada
              const infoExtra = response.data.find(
                (info: any) => info.clave === orden.claveProducto
              );
  
              if (infoExtra) {
                // Extraer y asignar los valores a los estados
                const bagSizeMatch = infoExtra.frgnName ? infoExtra.frgnName.match(/(\d+)(?=#)/) : null; // Extrae el número antes del símbolo #
                const extractedBagSize = bagSizeMatch ? bagSizeMatch[0] : "";
  
                // Si alguno de los valores es null, se deja en blanco.
                const frgnName = infoExtra.frgnName || "";
                const u_NombreLargo = infoExtra.u_NombreLargo || "";
  
                setBagSize(extractedBagSize);
                setItemDescription(`${frgnName} ${u_NombreLargo}`.trim()); // .trim() elimina espacios en blanco innecesarios
                setItemNumber(infoExtra.u_ItemNo || ""); // Establece en blanco si es null
                setInventoryLot(infoExtra.u_PO2 ? parseInt(infoExtra.u_PO2) : 0);
              }
            })
            .catch(error => {
              console.error('Error fetching InfoExtraQuality data:', error);
            });
        }
      });
    }
  }, [selectedArea, selectedOrden]);

  useEffect(() => {
    if (piezas !== undefined) {
      setTotalUnits(piezas);
    }
  }, [piezas]);
  
  
  // Abre el modal y genera la trazabilidad y el código RFID antes de abrirlo.
  const handleOpenModal = () => {
    {/*const today = new Date();
    const formattedDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);*/}
    generateBothCodes(); // Generar trazabilidad y RFID antes de abrir el modal
    setOpenModal(true);
  };
  
  // Para brindarle el estado de abrir o cerrar la modal
  const handleCloseModal = () => setOpenModal(false);

  // Valida los pesos y condiciones antes de proceder a la generación de la etiqueta.
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

// Manejador para cambiar el valor de peso de la tarima, validando que esté en el rango correcto.
const handlePesoTarimaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = parseFloat(event.target.value);
  if (!isNaN(value) && value >= 0 && value <= 52) {
    setPesoTarima(value);
  } else {
    console.error('El valor debe estar entre 0 y 52.');
    setPesoTarima(Math.max(Math.min(value, 52), 0));
  }
};
// Manejador para actualizar la fecha seleccionada
const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setDate(event.target.value);
};

const RedButton = styled(Button)({
  backgroundColor: 'red',
  color: 'white',
  '&:hover': {
    backgroundColor: 'darkred',
  },
});

   // Genera el código de trazabilidad y RFID.
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

 // Resetea los valores del formulario.
 const resetForm = () => {
  setPesoBruto(undefined);
  setPesoNeto(undefined);
  setPesoTarima(undefined);
  setPiezas(undefined);
  setResetKey(prevKey => prevKey + 1);  // Forzar rerender al incrementar la key
};

// Resetea los valores globales del formulario.
const resetValores = () => {
  setPiezas(0);
  setUnidad('');
  setDate('');
  setSelectedArea(undefined);
  setSelectedOrden(undefined);
  setSelectedMaquina(undefined);
  setSelectedTurno(undefined);
  setSelectedOperador(undefined);
  setFilteredProductos('');
  setPesoBruto(undefined);
  setPesoNeto(undefined);
  setPesoTarima(undefined);
  setResetKey(prevKey => prevKey + 1);
};

//Genera el rotulo de produccion en base a los datos ingresados 
const generatePDF = (data: EtiquetaData) => { //MODIFICAR ROTULO
  const { claveProducto, nombreProducto, orden, fecha } = data;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter'  // Puedes ajustar el tamaño de página según necesites
  });

  let piezasParaPDF = piezas; // Asumimos que `piezas` ya está definido en el estado
    if (claveUnidad === "MIL") {
      piezasParaPDF = piezasParaPDF ? piezasParaPDF / 1000 : 0;
    }
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
  doc.text(`${piezasParaPDF} ${claveUnidad}`, 122, 207);

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(5, 55, 275, 55);
  doc.line(5, 145, 275, 145);
  doc.line(5, 167, 275, 167);
  doc.line(117, 167, 117, 210);
  window.open(doc.output('bloburl'), '_blank');
};
const generatePDFWithQr = async (data: { area: string; claveProducto: string; nombreProducto: string; claveOperador: string; operador: string; turno: string; pesoTarima: string | number; pesoBruto: number; pesoNeto: number; piezas: number; trazabilidad: string; orden: string; rfid: string; status: number; uom: string; fecha: string; postExtrasWandW: { bagSize: string; itemDescription: string; itemNumber: string; inventoryLot: number; totalUnits: number; traceabilityCode: string; }; }) => {

  const splitText = (
      text: string,
      x: number,
      y: number,
      fontSize: number,
      maxWidth: number
  ): number => {
      doc.setFontSize(fontSize);
      const lines: string[] = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
          doc.text(line, x, y);
          y += fontSize * 0.4;
      });
      return y;
  };

  const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'A4',
  });

  doc.setFontSize(82);
  doc.text(`${bagSize}`, 7, 70);
  doc.setFontSize(38);
  doc.text(`LB`, 40, 70);
  doc.text(`${date}`, 213, 199);
  doc.setFontSize(44);
  doc.text(`DATE`, 227, 167);

  doc.setFontSize(54);
  let itemDescriptionY = 28;
  itemDescriptionY = splitText(itemDescription, 62, itemDescriptionY, 44, 135);

  doc.setFontSize(22);
  doc.text(`GROSS WEIGHT`, 12, 163);
  doc.text(`NET WEIGHT`, 112, 163);
  doc.setFontSize(28);
  doc.text(`${totalUnits}`, 190, 140);
  doc.setFontSize(38);
  doc.text(`ITEM NO. `, 7, 110);
  doc.text(`${itemNumber}`, 7, 122);

  doc.setFontSize(80);
  doc.text(`${pesoBruto}`, 12, 199);
  doc.text(`${pesoNeto}`, 112, 199);

  // Dibujar contornos y líneas
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.line(5, 85, 290, 85);
  doc.line(5, 145, 290, 145);
  doc.line(10, 155, 100, 155);
  doc.line(110, 155, 200, 155);
  doc.line(10, 200, 100, 200);
  doc.line(110, 200, 200, 200);
  doc.line(210, 170, 285, 170);
  doc.line(210, 200, 285, 200);
  doc.line(10, 155, 10, 200);
  doc.line(100, 155, 100, 200);
  doc.line(110, 155, 110, 200);
  doc.line(200, 155, 200, 200);
  doc.line(210, 170, 210, 200);
  doc.line(285, 170, 285, 200);
  // Carga y añade la imagen al PDF
  doc.addImage(wandw, "PNG", 195, 9, 100, 70);

  try {
    const bwipjs = require('bwip-js');
    // Genera el código de barras para 'piezas'
    const canvasTotal = document.createElement("canvas");
    await bwipjs.toCanvas(canvasTotal, {
        bcid: 'code39',               // Tipo de código de barras
        text: totalUnits.toString(),       // Texto a codificar (piezas)
        scale: 3,                      // Factor de escala
        height: 10,                    // Altura del código de barras, en milímetros
    });
    const totalQtyPalletUrl = canvasTotal.toDataURL("image/png");
    doc.addImage(totalQtyPalletUrl, "PNG", 155, 90, 100, 40);
} catch (error) {
    console.error("Error generating barcode:", error);
}

doc.save('rotulow&w.pdf');

};

 // Valida los campos requeridos antes de confirmar la etiqueta y realizar la impresión.
 const handleConfirmEtiqueta = () => {
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

  const area = areas.find(a => a.id === selectedArea)?.area;
  const orden = ordenes.find(o => o.id === selectedOrden)?.orden.toString() ?? "";
  const maquina = filteredMaquinas.find(m => m.id === selectedMaquina)?.maquina;
  const producto = filteredProductos;
  const turno = turnos.find(t => t.id === selectedTurno)?.turno;
  const operadorSeleccionado = operadores.find(o => o.id === selectedOperador);

  const data = {
      area: area || '',
      claveProducto: producto.split(' ')[0],
      nombreProducto: producto.split(' ').slice(1).join(' '),
      claveOperador: operadorSeleccionado ? operadorSeleccionado.numNomina : '',
      operador: operadorSeleccionado ? `${operadorSeleccionado.numNomina} - ${operadorSeleccionado.nombreCompleto}` : '',
      turno: turno || '',
      pesoTarima: pesoTarima !== undefined ? pesoTarima : '',
      pesoBruto: pesoBruto || 0,
      pesoNeto: pesoNeto || 0,
      piezas: piezas || 0,
      trazabilidad: trazabilidad,
      orden: orden || "",
      rfid: rfid,
      status: 1,
      uom: unidad,
      fecha: date,
      postExtrasWandW: {
        bagSize: bagSize,
        itemDescription: itemDescription,
        itemNumber: itemNumber,
        inventoryLot: inventoryLot,
        totalUnits: totalUnits,
        traceabilityCode: traceabilityCode
      },
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

  // Validación de campos requeridos
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
      { name: 'Orden', value: data.orden },
      { name: 'RFID', value: data.rfid },
      { name: 'UOM', value: data.uom },
      { name: 'Fecha', value: data.fecha },
      { name: 'Bag Size', value: data.postExtrasWandW.bagSize },
      { name: 'Item Description', value: data.postExtrasWandW.itemDescription },
      { name: 'Item Number', value: data.postExtrasWandW.itemNumber},
      { name: 'Inventory Lot', value: data.postExtrasWandW.inventoryLot },
      { name: 'Total Units', value: data.postExtrasWandW.totalUnits },
      { name: 'Traceabilty Code', value: data.postExtrasWandW.traceabilityCode }
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

  const url = `http://172.16.10.31/Printer/WandWPrinterIP?ip=${selectedPrinter.ip}`;

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
          generatePDFWithQr(data);
      })
      .catch(error => {
        // Obtener el mensaje de error específico del backend
        const errorMessage = error.response && error.response.data
            ? error.response.data
            : 'Hubo un error al generar la etiqueta.';
  
        // Verificar si el mensaje contiene el texto específico de "no está validada"
        if (errorMessage.includes("no está validada")) {
            Swal.fire({
                icon: 'error',
                title: 'Esta orden no esta validada',
                text: 'Para validar esta orden es necesario que acudas a programación.',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            });
        }
  
        console.error('Error al generar la etiqueta:', error);
    })
    .finally(() => {
        setIsSubmitting(false); // Rehabilitar el botón al finalizar el proceso
    });
};

  return (
    <div>
      <Box className='top-container-wandw'>
        <IconButton onClick={() => navigate('/ModulosImpresionQuality')} className='button-back'>
          <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
        </IconButton>
      </Box>
      <div className='impresion-container-wandw'>
      <Box className='impresion-card-wandw' sx={{ pt: 8 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          GENERACION ETIQUETA FORMATO WARNER AND WARNER
        </Typography>
        <Box className='impresion-form-wandw'>
        <TextField
        type="date"
        value={date}
        onChange={handleDateChange}
        InputLabelProps={{
          shrink: true,
        }}/>
          <Autocomplete
                key={`area-${resetKey}`}
                value={areas.find(area => area.id === selectedArea) || null}
                onChange={(event, newValue) => setSelectedArea(newValue?.id)}
                options={areas}
                getOptionLabel={(option) => option.area}
                renderInput={(params) => <TextField {...params} label="Área" fullWidth />}
            />
            <Autocomplete
              key={`orden-${resetKey}`}
              value={ordenes.find(o => o.id === selectedOrden) || null}
              onChange={(event, newValue) => setSelectedOrden(newValue?.id)}
              options={ordenes}
              getOptionLabel={(option) => option.orden.toString() + " - " + option.claveProducto + " " + option.producto}
              filterOptions={createFilterOptions({
                matchFrom: 'start',
                stringify: (option) => option.orden.toString() + " - " + option.claveProducto + " " + option.producto
              })}
              renderInput={(params) => <TextField {...params} label="Orden" />}
              noOptionsText={
                inputValue.length >= 5 ? (
                  <span style={{ color: "red", padding: "8px" }}>Orden sin ruta de proceso</span>
                ) : (
                  "No hay opciones"
                )
              }
              inputValue={inputValue}
              onInputChange={(event, newValue) => setInputValue(newValue)}
            />
            <Autocomplete
                key={`maquina-${resetKey}`}
                value={filteredMaquinas.find(m => m.id === selectedMaquina) || null}
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
                key={`turno-${resetKey}`}
                value={turnos.find(t => t.id === selectedTurno) || null}
                onChange={(event, newValue) => setSelectedTurno(newValue?.id)}
                options={turnos}
                getOptionLabel={(option) => option.turno}
                renderInput={(params) => <TextField {...params} label="Turno" />}
            />
            <Autocomplete
                key={`operador-${resetKey}`}
                value={operadores.find(o => o.id === selectedOperador) || null}
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
              label="#"
              variant="outlined"
              type="number"
              value={piezas === undefined ? '' : piezas} // Muestra un valor vacío si `piezas` es `undefined`
              onChange={e => setPiezas(parseFloat(e.target.value))}
            />
            <TextField
              label="Unidad"
              value={unidad} // Utiliza la variable de estado `unidad`
              InputProps={{
                readOnly: true, 
              }}
              variant="outlined"
            />
            <TextField
              key={`bag-size-${resetKey}`}
              fullWidth
              label="Bag Size"
              variant="outlined"
              value={bagSize}
              InputProps={{
                readOnly: true, // Campo de solo lectura
              }}
            />
            <TextField
              key={`item-description-${resetKey}`}
              fullWidth
              label="Item Description"
              variant="outlined"
              value={itemDescription}
              InputProps={{
                readOnly: true, // Campo de solo lectura
              }}
            />
            <TextField
              key={`item-number-${resetKey}`}
              fullWidth
              label="Item Number"
              variant="outlined"
              value={itemNumber}
              InputProps={{
                readOnly: true, // Campo de solo lectura
              }}
            />
            <TextField
              key={`inventory-lot-${resetKey}`}
              fullWidth
              label="Inventory Lot"
              variant="outlined"
              type="number"
              value={inventoryLot === undefined ? '' : inventoryLot}  // Asegúrate de manejar correctamente undefined
              onChange={e => setInventoryLot(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 0 } }} // Asegura que no se ingresen valores negativos
            />
            <TextField
              key={`total-units-${resetKey}`}
              fullWidth
              label="Total Units"
              variant="outlined"
              type="number"
              value={totalUnits === undefined ? '' : totalUnits} // Muestra un valor vacío si `totalUnits` es `undefined`
              onChange={e => setTotalUnits(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 0 }, 
              readOnly: true,}} // Asegura que no se ingresen valores negativos
            />
            <TextField
            fullWidth
            label="Pallet ID"
            variant="outlined"
            type="number"
            value={traceabilityCode} // Se muestra el Pallet ID generado
            InputProps={{ readOnly: true }} // Hace el campo de solo lectura si no requieres que sea editable
          />

        </Box>
        <Box className='impresion-button-wandw'>
          <RedButton variant="contained" onClick={resetValores}>
            RESETEAR VALORES
          </RedButton>
          <Button variant="contained" className="generate-button" onClick={handleGenerateEtiqueta}>
            VISTA PREVIA
          </Button>
        </Box>
      </Box>
      <Modal open={openModal} onClose={handleCloseModal} style={{ zIndex: 1050 }}>
        <Paper className="wandw-modal-content">
          <Box className="wandw-modal-header">
            <Typography variant="h6">Vista Previa de la Etiqueta</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box className="wandw-modal-body">
            <div className="row">
              <Typography><strong> PRODUCTO TERMINADO TARIMA</strong> </Typography>
            </div>
            <div className="row">
            </div>
            <div className="row">
              <Typography><strong>Área:</strong> {areas.find(a => a.id === selectedArea)?.area}</Typography>
            </div>
            <div className="row">
            <Typography><strong>Fecha:</strong> {date}</Typography>
            </div>
            <div className="row">
            <Typography><strong>Producto:</strong> {filteredProductos}</Typography>
            </div>
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
            <div className="row">
              <Typography><strong>Bag Size:</strong> {bagSize}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Item Number:</strong> {itemNumber}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Item Description:</strong> {itemDescription}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Inventory Lot:</strong> {inventoryLot}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Pallet ID:</strong> {traceabilityCode}</Typography>
            </div>
          </Box>
          <Box className="wandw-modal-footer">
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
              Guardar e Imprimir
            </Button>
          </Box>
        </Paper>
      </Modal>
    </div>
      <Box className='botttom-container-wandw'>
      
      </Box>
    </div>
    
  );
};

export default Etiquetado_WandW;
