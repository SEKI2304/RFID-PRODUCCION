import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import './consultabfx.scss';


interface RowData {
  id: number;
  area: string;
  fecha: string;
  claveProducto: string;
  nombreProducto: string;
  turno: string;
  operador: string;
  pesoBruto: number;
  pesoNeto: number;
  pesoTarima: number;
  piezas: number;
  trazabilidad: string;
  orden: number;
  rfid: string;
  uom: string;
  status: string;
}

const ConsultaBFX: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    axios.get('http://172.16.10.31/api/RfidLabel')
      .then(response => setRows(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'area', headerName: 'Área', width: 150 },
    { field: 'fecha', headerName: 'Fecha', width: 150 },
    { field: 'claveProducto', headerName: 'Clave Producto', width: 120 },
    { field: 'nombreProducto', headerName: 'Nombre Producto', width: 200 },
    { field: 'turno', headerName: 'Turno', width: 100 },
    { field: 'operador', headerName: 'Operador', width: 150 },
    { field: 'pesoTarima', headerName: 'Peso Tarima', type: 'number', width: 130 },
    { field: 'pesoBruto', headerName: 'Peso Bruto', type: 'number', width: 130 },
    { field: 'pesoNeto', headerName: 'Peso Neto', type: 'number', width: 130 },
    { field: 'piezas', headerName: 'Piezas', type: 'number', width: 100 },
    { field: 'trazabilidad', headerName: 'Trazabilidad', width: 150 },
    { field: 'orden', headerName: 'Orden', width: 120 },
    { field: 'rfid', headerName: 'RFID', width: 150 },
    { field: 'status', headerName: 'Estado', width: 100 },
    { field: 'uom', headerName: 'UOM', width: 100 },
  ];
  

  return (
    <div className='consulta-bfx'>
      <IconButton onClick={() => navigate('/Consultas')} sx={{ position: 'absolute', top: 16, left: 16 }}>
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Typography variant="h4" sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
        CONSULTA PT BIOFLEX
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
          pageSizeOptions={[5,10,25,50,100]}
          pagination
          className="MuiDataGrid-root"
        />
      </div>
    </div>
  );
};

export default ConsultaBFX;
