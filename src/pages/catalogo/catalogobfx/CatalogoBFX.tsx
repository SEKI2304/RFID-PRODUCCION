import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './catalogobfx.scss';
import {
  DataGrid,
  GridToolbar,
  GridRowsProp,
  GridColDef,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', maxWidth: 100 },
  { field: 'area', headerName: 'Area', maxWidth: 150, minWidth: 150 },
  { field: 'fecha', headerName: 'Fecha', maxWidth: 150, minWidth: 150 },
  { field: 'claveProducto', headerName: 'PT', maxWidth: 120, minWidth: 120 },
  { field: 'nombreProducto', headerName: 'Nombre Producto', minWidth: 500, width: 500 },
  { field: 'turno', headerName: 'Turno', maxWidth: 150 },
  { field: 'operador', headerName: 'Operador', minWidth: 300, maxWidth: 350 },
  { field: 'pesoBruto', headerName: 'Peso Bruto', maxWidth: 150, type: 'number' },
  { field: 'pesoNeto', headerName: 'Peso Neto', maxWidth: 150, type: 'number' },
  { field: 'pesoTarima', headerName: 'Peso Tarima', maxWidth: 150, type: 'number' },
  { field: 'piezas', headerName: 'Piezas', maxWidth: 150 },
  { field: 'trazabilidad', headerName: 'Trazabilidad', minWidth: 200, maxWidth: 200 },
  { field: 'orden', headerName: 'OT Y/O LOTE', maxWidth: 150 },
  { field: 'rfid', headerName: 'RFID', minWidth: 200, maxWidth: 200 },
  { field: 'status', headerName: 'STATUS', minWidth: 100, maxWidth: 100 },
];

const CatalogoBFX: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    axios
      .get('https://localhost:7204/api/RfidLabel')
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className='catalogo-bfx'>
      <IconButton
        onClick={() => navigate('/catalogos')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
          CATALOGO ETIQUETADO BIOFLEX
        </Typography>
      </Box>
      <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
        <DataGrid
          columns={columns}
          disableDensitySelector
          disableColumnFilter
          disableColumnSelector
          rows={rows}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
        />
      </Box>
    </div>
  );
};

export default CatalogoBFX;
