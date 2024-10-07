import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, Typography, } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import './consultavaso.scss';
import Swal from 'sweetalert2';
import PrintIcon from '@mui/icons-material/Print';
import jsPDF from 'jspdf';
import ArticleIcon from '@mui/icons-material/Article';

interface RowData {
  id: number;
  area: string;
  fecha: string;
  claveProducto: string;
  nombreProducto: string;
  claveOperador: string;
  operador: string;
  turno: string;
  pesoTarima: number;
  pesoBruto: number;
  pesoNeto: number;
  piezas: number;
  trazabilidad: string;
  orden: string;
  rfid: string;
  status: number;
  uom: string | null;
  amountPerBox: number;
  boxes: number;
  totalAmount: number;
  prodEtiquetaRFIDId: number;
}
interface Printer {
  id: number;
  name: string;
  ip: string;
}

const printers: Printer[] = [
  { id: 1, name: 'Impresora 1', ip: '172.16.20.56' },
  { id: 2, name: 'Impresora 2', ip: '172.16.20.57' },
  { id: 3, name: 'Impresora 3', ip: '172.16.20.112' }
];

const ConsultaVaso: React.FC = () => {
  const navigate = useNavigate();
  const [claveUnidad, setClaveUnidad] = useState('');
  const [rows, setRows] = useState<GridRowsProp>([]);

  const showPrinterSelection = (row: RowData) => {
    Swal.fire({
      title: 'Seleccionar Impresora',
      input: 'select',
      inputOptions: printers.reduce((options, printer) => {
        options[printer.id] = printer.name;
        return options;
      }, {} as Record<number, string>),
      inputPlaceholder: 'Selecciona una impresora',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: (selectedPrinterId) => {
        const selectedPrinter = printers.find(printer => printer.id === Number(selectedPrinterId));
        if (!selectedPrinter) {
          Swal.showValidationMessage('Por favor, selecciona una impresora');
        }
        return selectedPrinter;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const selectedPrinter = result.value as Printer;
        const postData = {
          area: row.area,
          claveProducto: row.claveProducto,
          nombreProducto: row.nombreProducto,
          claveOperador: row.claveOperador,
          operador: row.operador,
          turno: row.turno,
          pesoTarima: row.pesoTarima,
          pesoBruto: row.pesoBruto,
          pesoNeto: row.pesoNeto,
          piezas: row.piezas,
          trazabilidad: row.trazabilidad,
          orden: row.orden,
          rfid: row.rfid,
          status: row.status,
          fecha: row.fecha,
          postExtraVasoDto: { // Change the key here
            prodEtiquetaRFIDId: row.prodEtiquetaRFIDId,
            amountPerBox: row.amountPerBox,
            boxes: row.boxes,
            totalAmount: row.totalAmount
          },
        };

        axios.post(`http://172.16.10.31/api/Vaso/PrintVasoLabel?ip=${selectedPrinter.ip}`, postData)
          .then(response => {
            console.log('Impresión iniciada:', response.data);
            Swal.fire('Éxito', 'Impresión iniciada correctamente', 'success');
          })
          .catch(error => {
            console.error('Error al imprimir:', error);
            Swal.fire('Error', 'Hubo un error al iniciar la impresión', 'error');
          });
      }
    });
  };

  const handlePrintClick = (row: RowData) => {
    showPrinterSelection(row);
  };

  const formatDate = (dateTime: string): string => {
    const date = new Date(dateTime);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan en 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const generatePDF = (data: RowData) => { //MODIFICAR ROTULO
    const { claveProducto, nombreProducto, boxes, orden, fecha } = data;
    const formattedDate = formatDate(fecha);

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
    doc.text(`${formattedDate} `, 155, 161);

    const unidad = claveUnidad || 'XBX';

    doc.setFontSize(110);
    doc.text(`${boxes} ${unidad}`, 70, 207);

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(5, 55, 275, 55);
    doc.line(5, 145, 275, 145);
    doc.line(5, 167, 275, 167);
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleGeneratePDFClick = (row: RowData) => {
    generatePDF(row);
  };

  useEffect(() => {
    axios.get('http://172.16.10.31/api/Vaso')
      .then(response => {
        setRows(response.data.map((item: any) => ({
          id: item.id,
          area: item.area,
          fecha: item.fecha,
          claveProducto: item.claveProducto,
          nombreProducto: item.nombreProducto,
          claveOperador: item.claveOperador,
          operador: item.operador,
          turno: item.turno,
          pesoTarima: item.pesoTarima,
          pesoBruto: item.pesoBruto,
          pesoNeto: item.pesoNeto,
          piezas: item.piezas,
          trazabilidad: item.trazabilidad,
          orden: item.orden,
          rfid: item.rfid,
          status: item.status,
          uom: item.uom,
          amountPerBox: item.prodVasos.amountPerBox,
          boxes: item.prodVasos.boxes,
          totalAmount: item.prodVasos.totalAmount,
          prodEtiquetaRFIDId: item.prodVasos.prodEtiquetaRFIDId
        })));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);


  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'area', headerName: 'Area', width: 150 },
    { field: 'fecha', headerName: 'Fecha', width: 200 },
    { field: 'claveProducto', headerName: 'Clave Producto', width: 150 },
    { field: 'nombreProducto', headerName: 'Nombre Producto', width: 200 },
    { field: 'claveOperador', headerName: 'Clave Operador', width: 150 },
    { field: 'operador', headerName: 'Operador', width: 200 },
    { field: 'turno', headerName: 'Turno', width: 100 },
    { field: 'trazabilidad', headerName: 'Trazabilidad', width: 200 },
    { field: 'orden', headerName: 'Orden', width: 100 },
    { field: 'rfid', headerName: 'RFID', width: 200 },
    { field: 'prodEtiquetaRFIDId', headerName: 'ID RFID', width: 200 },
    { field: 'status', headerName: 'Status', width: 100 },
    { field: 'amountPerBox', headerName: 'Amount Per Box', width: 150 },
    { field: 'boxes', headerName: 'Boxes', width: 100 },
    { field: 'totalAmount', headerName: 'Total Amount', width: 150 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      sortable: false,
      filterable: false,
      width: 200,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handlePrintClick(params.row)}>
            <PrintIcon />
          </IconButton>
          <IconButton onClick={() => handleGeneratePDFClick(params.row)}>
            <ArticleIcon />
          </IconButton>
        </>
      ),
    },
  ];
  

  return (
    <div className='consulta-vaso'>
      <IconButton onClick={() => navigate('/Consultas')} className="back-button">
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Typography variant="h4" className="title">
        CONSULTA PT VASO
      </Typography>
      <div className="data-grid-container">
        <DataGrid
          columns={columns}
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          rows={rows}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 25,
              },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          pagination
          className="MuiDataGrid-root"
        />
      </div>
    </div>
  );
};

export default ConsultaVaso;
