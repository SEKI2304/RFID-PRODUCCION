import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Modal, 
  Paper,
  IconButton,
  Autocomplete,
  SxProps,
  Theme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './reentarimado-bobina.scss';
import { formatDate } from 'date-fns';
import { wrapText } from '../../../utils/functions';
import jsPDF from "jspdf";
import QRCode from "qrcode";


interface Printer {
  name: string;
  ip: string;
}

interface BobinaData {
  tipoProducto: string;
  claveProducto: string;
  productoNombre: string;
  claveOperador: string;
  medida: number;
  calibre: number;
  piezas: number;
  peso: number;
  fechaProduccion: string;
  codigoBobina: string;
  trazabilidad: string;
  rfid: string;
  status: number;
  claveUnidad: string;
}

interface BobinaDataResponse {
  success: boolean;
  data: BobinaData[];
  message: string;
}

interface RegistroTrazabilidad {
  trazabilidad: string;
}
interface Operador {
  numNomina: string;
  nombreCompleto: string;
}


const ReetiquetadoBobina: React.FC = () => {
  const navigate = useNavigate();
  const [trazabilidadInput, setTrazabilidadInput] = useState<string>('');
  const [bobinaData, setBobinaData] = useState<BobinaData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newPeso, setNewPeso] = useState<string>('');
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<Printer | null>(null);
  const [newTrazabilidad, setNewTrazabilidad] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [operadores, setOperadores] = useState<Operador[]>([]);

  const printerOptions: Printer[] = [
    { name: "Impresora 1", ip: "172.16.20.56" },
    { name: "Impresora 2", ip: "172.16.20.57" },
    { name: "Impresora 3", ip: "172.16.20.112" }
  ];

  const textFieldStyle: SxProps<Theme> = {
    backgroundColor: '#ffffff',
    '& .MuiOutlinedInput-root': {
      color: '#000000',
      '& input': {
        color: '#000000',
      },
      '&:hover fieldset': {
        borderColor: '#46707e',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#46707e',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(0, 0, 0, 0.7)',
      '&.Mui-focused': {
        color: '#46707e',
      },
    },
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Fecha inválida"; // Manejar valores vacíos o nulos
  
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha inválida"; // Manejar fechas inválidas
  
    const meses = [
      "ENE", "FEB", "MAR", "ABR", "MAY", "JUN",
      "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
    ];
    
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
  
    return `${mes} ${año}`;
  };

  const fetchBobinaData = async (): Promise<void> => {
    if (!trazabilidadInput) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor ingrese una trazabilidad',
      });
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.get<BobinaData[]>(
        `http://172.16.10.31/api/RfidLabelMP/BobinaByTrazabilidad?Trazabilidad=${trazabilidadInput}`
      );
  
      // Verificar si hay datos en el array
      if (response.data && response.data.length > 0) {
        // Tomar el primer elemento del array
        setBobinaData(response.data[0]);
        await generateNewTrazabilidad(trazabilidadInput);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No encontrado',
          text: 'No se encontraron datos para esta trazabilidad',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los datos de la bobina',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewTrazabilidad = async (trazabilidadOriginal: string): Promise<void> => {
    try {
      // Tomamos los primeros 10 dígitos de la trazabilidad original
      const prefixTrazabilidad = trazabilidadOriginal.substring(0, 10);
  
      // Obtener todos los registros
      const response = await axios.get<RegistroTrazabilidad[]>('http://172.16.10.31/api/ProdEtiquetasRFIDMP');
      const registros = response.data;
  
      // Filtrar registros que empiecen con el mismo prefijo
      const matchingRegistros = registros.filter(
        (registro: RegistroTrazabilidad) => registro.trazabilidad.startsWith(prefixTrazabilidad)
      );
  
      let nextConsecutivo = 1;
      if (matchingRegistros.length > 0) {
        // Obtener los últimos 3 dígitos de cada registro coincidente
        const ultimos3Digitos = matchingRegistros.map((registro: RegistroTrazabilidad) =>
          parseInt(registro.trazabilidad.slice(-3), 10)
        );
  
        // Encontrar el número más alto y sumar 1
        nextConsecutivo = Math.max(...ultimos3Digitos) + 1;
      }
  
      // Formatear el nuevo consecutivo a 3 dígitos
      const consecutivoStr = nextConsecutivo.toString().padStart(3, '0');
      
      // Crear la nueva trazabilidad
      const nuevaTrazabilidad = `${prefixTrazabilidad}${consecutivoStr}`;
      setNewTrazabilidad(nuevaTrazabilidad);
  
    } catch (error) {
      console.error('Error generando nueva trazabilidad:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al generar nueva trazabilidad',
      });
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (!selectedPrinter || !bobinaData || !selectedOperador) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Por favor complete todos los campos requeridos.',
      });
      return;
    }
  
    const formattedFechaProduccion = new Date().toISOString(); // Asegurar formato ISO 8601
    const pesoValue = newPeso ? parseFloat(newPeso) : 0; // Asegurar que es numérico
    const medidaValue = bobinaData.medida ? Number(bobinaData.medida) : 0; 
    const calibreValue = bobinaData.calibre ? Number(bobinaData.calibre) : 0;
    const piezasValue = 1; // Asegurar que `piezas` es un número
    const claveOperadorValue = selectedOperador.numNomina.toString(); // Convertir a string
  
    const data = {
      tipoProducto: "BOBINA",
      claveProducto: bobinaData.claveProducto,
      productoNombre: bobinaData.productoNombre,
      claveOperador: claveOperadorValue,
      medida: medidaValue,      // Number format
      calibre: calibreValue,    // Number format
      piezas: piezasValue,
      peso: pesoValue,
      fechaProduccion: formattedFechaProduccion,
      codigoBobina: bobinaData.codigoBobina,
      trazabilidad: newTrazabilidad,
      rfid: `000${newTrazabilidad}`,
      status: 7,
      claveUnidad: bobinaData.claveUnidad
    }
  
    try {
      const url = `http://172.16.10.31/api/ProdEtiquetasRFIDMP/bobina?ip=${selectedPrinter.ip}`;
      const response = await axios.post(url, data);
  
      if (response.status === 200 || response.status === 201) {
        await generateDetailedPDF([data]);
  
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "Etiqueta generada correctamente",
        });
  
        setIsModalOpen(false);
        clearForm();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error inesperado: ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error("Error:", error);
  
      if (axios.isAxiosError(error) && error.response) {
        Swal.fire({
          icon: "error",
          title: "Error del Servidor",
          text: `Código ${error.response.status}: ${error.response.data || "Error desconocido"}`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al generar la etiqueta. Verifica la conexión al servidor.",
        });
      }
    }
  };

  const clearForm = (): void => {
    setBobinaData(null);
    setTrazabilidadInput('');
    setNewPeso('');
    setSelectedOperador(null);
    setSelectedPrinter(null);
    setNewTrazabilidad('');
  };


  useEffect(() => {
    axios.get<Operador[]>('http://172.16.10.31/api/Operator/all-operators')
      .then(response => {
        setOperadores(response.data);
      })
      .catch(error => {
        console.error('Error al obtener operadores:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar la lista de operadores',
        });
      });
  }, []);

  const generateDetailedPDF = async (dataArray: any[]) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "A4",
    });
  
    const addQRToPDF = async (
      text: string,
      x: number,
      y: number,
      size: number = 40
    ) => {
      try {
        const url = await QRCode.toDataURL(text, {
          scale: 8,
          margin: 0,
          errorCorrectionLevel: "H",
        });
        doc.addImage(url, "JPEG", x, y, size, size);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };
  
    for (let i = 0; i < dataArray.length; i++) {
      if (i > 0) {
        doc.addPage();
      }
      const data = dataArray[i];
      doc.setFont("helvetica", "normal");
      doc.setFontSize(26);
  
      // Convertimos valores numéricos a string solo para el PDF
      const medida = data.medida.toString();
      const calibre = data.calibre.toString();
      const peso = data.peso.toString();
  
      // Textos verticales
      doc.text("MEDIDA", 15, 110, { angle: 90 });
      doc.text("CALIBRE", 147, 110, { angle: 90 });
      doc.text("PESO", 15, 195, { angle: 90 });
      doc.text("FECHA", 204, 195, { angle: 90 });
      doc.setFontSize(72);
      doc.text("CM", 135, 111, { angle: 90 });
      doc.text("M", 246, 110, { angle: 90 });
      doc.setFontSize(42);
      doc.text("CODIGO:", 5, 128);
      doc.text(data.claveProducto, 138, 128);
  
      // Ajustar el nombre del producto con wrapping
      const maxWidth = 290; // Ancho máximo ajustado para el espacio disponible
      wrapText(doc, data.productoNombre, 5, 22, maxWidth, 80);
  
      doc.setFontSize(110);
      doc.text(medida, 19, 110);  // Ahora es string
      doc.text(calibre, 150, 110);
      doc.setFontSize(120);
      doc.text(peso, 19, 195);
      
      // Formatear y mostrar la fecha
      doc.setFontSize(50);
      const formattedDate = formatDate(data.fechaProduccion);
      doc.text(formattedDate, 208, 195);
  
      doc.setFontSize(65);
      doc.text(data.codigoBobina, 5, 153);
  
      // Líneas
      doc.setDrawColor(0);
      doc.setLineWidth(0.2);
      doc.line(115, 70, 115, 112);
      doc.line(224, 70, 224, 112);
  
      doc.setLineWidth(0.5);
      // Líneas horizontales
      doc.line(5, 70, 290, 70);
      doc.line(5, 112, 290, 112);
      doc.line(5, 112, 290, 112);
      doc.line(137, 130, 290, 130);
      doc.line(5, 155, 290, 155);
      doc.line(5, 197, 290, 197);
  
      // Líneas verticales
      doc.line(5, 70, 5, 112);
      doc.line(17, 70, 17, 112);
      doc.line(137, 70, 137, 112);
      doc.line(137, 112, 137, 130);
      doc.line(290, 112, 290, 130);
      doc.line(149, 70, 149, 112);
      doc.line(248, 70, 248, 112);
      doc.line(290, 70, 290, 112);
      doc.line(5, 155, 5, 197);
      doc.line(17, 155, 17, 197);
      doc.line(194, 155, 194, 197);
      doc.line(206, 155, 206, 197);
      doc.line(290, 155, 290, 197);
  
      // Agregar QR pequeño
      await addQRToPDF(data.trazabilidad, 249, 71, 40);
    }
    doc.save("etiquetas_detalladas.pdf");
  };


  return (
    <Box className="impresion-container-mp">
      <Box className="top-container-mp">
      <IconButton 
        className="button-back"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
    </Box>
      <Paper className="impresion-card-mp">
        <Typography variant="h4" gutterBottom>
          Re-etiquetado de Bobinas
        </Typography>

        <Box className="impresion-form-mp">
          <TextField
            label="Trazabilidad"
            value={trazabilidadInput}
            onChange={(e) => setTrazabilidadInput(e.target.value)}
            fullWidth
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                color: '#000000',
                '& input': {
                  color: '#000000',
                },
                '&:hover fieldset': {
                  borderColor: '#46707e',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#46707e',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.7)',
                '&.Mui-focused': {
                  color: '#46707e',
                },
              },
            }}
          />

          <Button
            variant="contained"
            onClick={fetchBobinaData}
            disabled={loading}
            className="generate-button"
          >
            {loading ? 'Buscando...' : 'Buscar Bobina'}
          </Button>

          {bobinaData && (
            <>
              <TextField
                label="Nuevo Peso"
                type="number"
                value={newPeso}
                onChange={(e) => setNewPeso(e.target.value)}
                fullWidth
              />
             <Autocomplete<Operador, false, false, false>
            value={selectedOperador}
            onChange={(_, newValue) => setSelectedOperador(newValue)}
            options={operadores}
            getOptionLabel={(option) => `${option.numNomina} - ${option.nombreCompleto}`}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Seleccionar Operador"
                fullWidth
                sx={textFieldStyle}
              />
            )}
            isOptionEqualToValue={(option, value) => option.numNomina === value.numNomina}
          />
            </>
          )}
        </Box>

        {bobinaData && (
          <Box mt={2}>
            <Typography variant="h6" gutterBottom>
              Detalles de la Bobina
            </Typography>
            <Box className="mp-info-grid">
              <Typography><strong>Tipo:</strong> {bobinaData.tipoProducto}</Typography>
              <Typography><strong>Clave Producto:</strong> {bobinaData.claveProducto}</Typography>
              <Typography><strong>Producto:</strong> {bobinaData.productoNombre}</Typography>
              <Typography><strong>Medida:</strong> {bobinaData.medida}</Typography>
              <Typography><strong>Calibre:</strong> {bobinaData.calibre}</Typography>
              <Typography><strong>Peso Actual:</strong> {bobinaData.peso}</Typography>
              <Typography><strong>Código Bobina:</strong> {bobinaData.codigoBobina}</Typography>
              <Typography><strong>Fecha Produccion:</strong> {bobinaData.fechaProduccion}</Typography>
            </Box>

            <Box className="impresion-button-mp">
              <Button
                variant="contained"
                onClick={() => setIsModalOpen(true)}
                className="generate-button"
                fullWidth
              >
                Generar Nueva Etiqueta
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        style={{zIndex: 1050}}
      >
        <Box className="mp-modal-content">
          <Box className="mp-modal-header">
            <Typography variant="h6">Confirmar Información</Typography>
            <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
          </Box>

          <Box className="mp-modal-body">
            <Typography><strong>Tipo:</strong> {bobinaData?.tipoProducto}</Typography>
            <Typography><strong>Clave Producto:</strong> {bobinaData?.claveProducto}</Typography>
            <Typography><strong>Producto:</strong> {bobinaData?.productoNombre}</Typography>
            <Typography><strong>Nuevo Peso:</strong> {newPeso}</Typography>
            <Typography><strong>Operador:</strong> {selectedOperador ? `${selectedOperador.numNomina} - ${selectedOperador.nombreCompleto}` : ''}</Typography>
            <Typography><strong>Nueva Trazabilidad:</strong> {newTrazabilidad}</Typography>
          </Box>

          <Box className="mp-modal-footer">
            <Autocomplete<Printer, false, false, false>
              value={selectedPrinter}
              onChange={(_, newValue) => setSelectedPrinter(newValue)}
              options={printerOptions}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar Impresora"
                  sx={{ width: 200 }}
                />
              )}
            />
            <Button
              variant="contained"
              onClick={handleConfirm}
              className="generate-button"
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ReetiquetadoBobina;

function setClaveOperador(arg0: string) {
  throw new Error('Function not implemented.');
}
