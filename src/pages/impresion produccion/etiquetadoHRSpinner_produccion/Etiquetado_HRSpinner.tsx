import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography, Modal, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import './Etiquetado_HRSpinner.scss';
import { Autocomplete, createFilterOptions } from '@mui/material';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles';
import QRCode from "qrcode";

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

const Etiquetado_HRSpinner: React.FC = () => {
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
  const [piezas, setPiezas] = useState<number>(0); // Inicializa con 0
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
  const [traceabilityCode, setTraceabilityCode] = useState<string>('');
  const [customerItemNumber, setCustomerItemNumber] = useState<string>("");
  const [customerLot, setCustomerLot] = useState<string>("");
  const [dimensions, setDimensions] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [qpsPartNumber, setQpsPartNumber] = useState<string>("");
  const [qtyPerCase, setQtyPerCase] = useState<number | "">(""); // Cantidad por caja (permitimos "" para manejar un campo vacío)
const [qtyPerPallet, setQtyPerPallet] = useState<number | "">(""); // Cantidad por pallet// Cantidad por pallet
  const [wicket, setWicket] = useState<string>(""); 
  const [multipleValuesCode, setMultipleValuesCode] = useState<string>(""); // Estado para almacenar el código concatenado
  // Aqui se asginan los nombres y las IP de las impresoras
  const printerOptions = [
    { name: "Impresora 1", ip: "172.16.20.56" },
    { name: "Impresora 2", ip: "172.16.20.57" },
    { name: "Impresora 3", ip: "172.16.20.112" }
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
    if (customerItemNumber && customerLot && qtyPerCase && qpsPartNumber) {
      // Construye el código concatenado
      const concatenatedCode = `(241)${customerItemNumber}(10)${customerLot}(30)${qtyPerCase}(240)${qpsPartNumber}`;
  
      // Actualiza el estado con el código concatenado
      setMultipleValuesCode(concatenatedCode);
    }
  }, [customerItemNumber, customerLot, qtyPerCase, qpsPartNumber]);

  useEffect(() => {
    if (selectedArea && selectedOrden) {
      axios
        .get<Orden[]>(`http://172.16.10.31/api/Order?areaId=${selectedArea}`)
        .then((response) => {
          const orden = response.data.find((orden) => orden.id === selectedOrden);
          if (orden) {
            const productoConcatenado = `${orden.claveProducto} ${orden.producto}`;
            setFilteredProductos(productoConcatenado); // Establece el producto concatenado
            setUnidad(orden.unidad || "default_unit"); // Establece la unidad o una por defecto si no existe
  
            // Aplica la lógica para claveUnidad
            const validKeys = ["MIL", "XBX", "H87"];
            const nuevaClaveUnidadLocal = validKeys.includes(orden.claveUnidad)
              ? orden.claveUnidad
              : "Pzas";
            setClaveUnidad(nuevaClaveUnidadLocal);
  
            // Realiza la petición al endpoint InfoExtraQuality
            axios
              .get("http://172.16.10.31/api/InfoExtraQuality")
              .then((response) => {
                // Filtrar la información basada en la clave y la orden seleccionada
                const infoExtra = response.data.find(
                  (info: any) => info.clave === orden.claveProducto
                );
  
                if (infoExtra) {
                  // Extraer y asignar los valores a los estados
                  const customerItemNumber = infoExtra.u_PO1 || ""; // u_PO1
                  const customerLot = infoExtra.u_PO2 || ""; // u_PO2
                  const dimensions = infoExtra.u_Medidas
                    ? infoExtra.u_Medidas.match(/.*?Lip/)?.[0] || "" // Extrae hasta "Lip"
                    : ""; // Si no existe, asigna una cadena vacía
                  const productDescription = infoExtra.frgnName || ""; // frgnName
                  const qpsPartNumber = infoExtra.u_ItemNo || ""; // u_ItemNo
  
                  // Establecer los valores en los estados
                  setCustomerItemNumber(customerItemNumber);
                  setCustomerLot(customerLot);
                  setDimensions(dimensions);
                  setProductDescription(productDescription);
                  setQpsPartNumber(qpsPartNumber);
                }
              })
              .catch((error) => {
                console.error("Error fetching InfoExtraQuality data:", error);
              });
          }
        });
    }
  }, [selectedArea, selectedOrden]);
  
  const handleOpenModal = () => {
    generateBothCodes(); 
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
  setPiezas(0);
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
   // Ajustar el valor de piezas si claveUnidad es "MIL"
   const piezasAjustadas = claveUnidad === "MIL" ? (piezas / 1000).toFixed(3) : piezas;

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
  doc.text(`${piezasAjustadas} ${claveUnidad}`, 122, 207);

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(5, 55, 275, 55);
  doc.line(5, 145, 275, 145);
  doc.line(5, 167, 275, 167);
  doc.line(117, 167, 117, 210);
  window.open(doc.output('bloburl'), '_blank');
};

const generatePDFWithQr = async (data: {} ) => {


  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "A4",
  });
  const splitText = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    maxWidth: number
  ): number => {
    doc.setFontSize(fontSize);
    const lines: string[] = doc.splitTextToSize(text, maxWidth); // Divide el texto para que se ajuste al ancho máximo
    lines.forEach((line: string) => {
      doc.text(line, x, y);
      y += fontSize * 0.3; // Aumentar 'y' para la siguiente línea basada en el tamaño de la fuente
    });
    return y; // Retorna la nueva posición 'y' después de las líneas
  };
  // Imprimir 'productDescription' dinámicamente
  let currentY = 40; // Posición inicial Y para 'productDescription'
  currentY = splitText(productDescription, 5, currentY, 56, 290);

  doc.setFont("helvetica", "bold"); // Configurar la fuente en negrita
  doc.setFontSize(26);
  doc.text("CUSTOMER:", 5, 12);

  // Secciones del PDF
  doc.setFont("helvetica", "normal");
  doc.setFontSize(15);
  doc.text("PRODUCT DESCRIPTION:", 5, 23);
  doc.text("CUSTOMER ITEM NUMBER:", 5, 69);
  doc.text("DIMENSIONS:", 140, 78);
  doc.text("WICKET:", 140, 100);
  doc.text("QPS PART NUMBER:", 140, 124);
  doc.text("LOT CODE:", 140, 146);
  doc.text("QTY PER CASE:", 140, 170);
  doc.text("QTY PER PALLET:", 195, 170);

  // Valores dinámicos
  doc.setFont("helvetica", "normal");
  doc.setFontSize(26);
  doc.text("H.R. Spinner", 62, 12);
  doc.setFontSize(50);
  doc.text(customerItemNumber, 5, 86);
  doc.setFontSize(36);
  doc.text(dimensions, 140, 91);
  doc.text(wicket, 140, 114);
  doc.text(qpsPartNumber, 140, 137);
  doc.text(customerLot, 140, 159);
  doc.text(qtyPerCase.toString(), 140, 185);
  doc.text(qtyPerPallet.toString(), 195, 185);

  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(5, 15, 290, 15);
  // QR Code del código con varios valores
  const addQRToPDF = async (
    text: string,
    x: number,
    y: number,
    size: number = 100, // Tamaño del QR
    label: string, // Texto para escribir debajo del QR
    labelFontSize: number = 14 // Tamaño del texto
  ) => {
    try {
      // Generar el QR eliminando la "quiet zone" (espacio en blanco)
      const url = await QRCode.toDataURL(text, { scale: 8, margin: 0 }); // `margin: 0` elimina el espacio en blanco

      // Agregar el QR al PDF
      doc.addImage(url, "JPEG", x, y, size, size);

      // Escribir el texto debajo del QR
      doc.setFontSize(labelFontSize);
      const labelX = x + size / 2; // Centrar texto horizontalmente respecto al QR
      const labelY = y + size + 10; // Colocar texto justo debajo del QR con margen de 10
      doc.text(label, labelX, labelY, { align: "center" });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  // Llamar a la función con un texto debajo del QR
  await addQRToPDF(multipleValuesCode, 17, 90, 100, multipleValuesCode, 16);
  doc.save("etiqueta.pdf");
};

 // Valida los campos requeridos antes de confirmar la etiqueta y realizar la impresión.
const handleConfirmEtiqueta = () => {
  if (!selectedPrinter) {
      Swal.fire({
          icon: 'warning',
          title: 'Impresora no seleccionada',
          text: 'Por favor, seleccione una impresora.',
      });
      return;
  }

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
      postExtraHRSpinner: {
      productDescription: productDescription,
      customerItemNumber: customerItemNumber,
      dimensions: dimensions,
      wicket: wicket,
      qpsPartNumber: qpsPartNumber,
      lotCode: customerLot,
      qtyPerCase: qtyPerCase,
      qtyPerPallet: qtyPerPallet
      }
  };

  // Validación de peso bruto y peso neto
  if (data.pesoBruto === 0 || data.pesoNeto === 0) {
      Swal.fire({
          icon: 'warning',
          title: 'Pesos inválidos',
          text: 'El peso bruto y el peso neto no pueden ser 0.',
      });
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
  ];

  const emptyFields = requiredFields.filter(field => field.value === null || field.value === undefined || field.value === '');

  if (emptyFields.length > 0) {
      Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: `Por favor, complete los siguientes campos: ${emptyFields.map(field => field.name).join(', ')}.`,
      });
      return;
  }

  const url = `http://172.16.10.31/Printer/HRSpinnerPrinterIP?ip=${selectedPrinter.ip}`;

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
          generatePDFWithQr(data)
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
    <div>
      <Box className='top-container-wandw'>
        <IconButton onClick={() => navigate('/ModulosImpresionQuality')} className='button-back'>
          <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
        </IconButton>
      </Box>
      <div className='impresion-container-wandw'>
      
      <Box className='impresion-card-wandw' sx={{ pt: 8 }}>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          GENERACION ETIQUETA FORMATO H.R. SPINNER
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
              label="Customer item Description"
              value={customerItemNumber} // Utiliza la variable de estado `customerItemNumber`
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <TextField
              label="Lot Code"
              value={customerLot} // Utiliza la variable de estado `customerLot`
              onChange={(event) => setCustomerLot(event.target.value)} // Permite la edición
              variant="outlined"
            />
            <TextField
              label="Dimensions"
              value={dimensions} // Utiliza la variable de estado `dimensions`
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <TextField
              label="Product Description"
              value={productDescription} // Utiliza la variable de estado `productDescription`
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <TextField
              label="QPS Part Number"
              value={qpsPartNumber} // Utiliza la variable de estado `qpsPartNumber`
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
            <TextField
              label="Wicket"
              value={wicket} // Utiliza la variable de estado `wicket`
              onChange={(event) => setWicket(event.target.value)} // Permite edición
              variant="outlined"
            />
            <TextField
              label="Cantidad por Caja"
              type="number" // Solo permite números
              value={qtyPerCase} // Valor del estado
              onChange={(event) =>
                setQtyPerCase(event.target.value === "" ? "" : parseInt(event.target.value)) // Convierte a número o permite un campo vacío
              }
              variant="outlined"
            />
            <TextField
              label="Cantidad por Tarima"
              type="number" // Solo permite números
              value={qtyPerPallet} // Valor del estado
              onChange={(event) =>
                setQtyPerPallet(event.target.value === "" ? "" : parseInt(event.target.value)) // Convierte a número o permite un campo vacío
              }
              variant="outlined"
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
              <Typography><strong>Customer Item Number:</strong> {customerItemNumber}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Customer Lot:</strong> {customerLot}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Dimensions:</strong> {dimensions}</Typography>
            </div>
            <div className="row">
              <Typography><strong>QPS Part Number:</strong> {qpsPartNumber}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Cantidad por Caja:</strong> {qtyPerCase}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Total Piezas Tarima:</strong> {qtyPerPallet}</Typography>
            </div>
            <div className="row">
              <Typography><strong>Wicket:</strong> {wicket}</Typography>
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

export default Etiquetado_HRSpinner;
