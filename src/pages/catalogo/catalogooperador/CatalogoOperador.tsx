import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  DataGrid,
  GridToolbar,
  GridRowsProp,
  GridColDef,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import './catalogooperador.scss';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', maxWidth: 100 },
  { field: 'numNomina', headerName: 'Número de Nómina', maxWidth: 150, minWidth: 150 },
  { field: 'clave', headerName: 'Clave', maxWidth: 150, minWidth: 150 },
  { field: 'nombreCompleto', headerName: 'Nombre Completo', maxWidth: 350, minWidth: 350 },
  { field: 'tipoUsuario', headerName: 'Tipo de Usuario', minWidth:180 ,maxWidth: 180 },
  { field: 'id_Area', headerName: 'ID Área',minWidth:150, maxWidth: 150 },
  { field: 'id_Turno', headerName: 'ID Turno',minWidth:150 ,maxWidth: 150 },
  { field: 'codeQR', headerName: 'Código QR', minWidth: 400, maxWidth: 400 },
  { field: 'status', headerName: 'Status', maxWidth: 150 },
];

const CatalogoOperador: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    axios
      .get('https://localhost:7204/api/Operator/all-operators')
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className='catalogo-operador'>
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
          CATALOGO OPERADORES
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
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
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

export default CatalogoOperador;
