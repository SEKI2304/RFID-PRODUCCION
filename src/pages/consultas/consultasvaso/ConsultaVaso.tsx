import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, Typography, } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import './consultavaso.scss';

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

const ConsultaVaso: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);

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
