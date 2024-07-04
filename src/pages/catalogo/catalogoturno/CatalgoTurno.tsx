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
import './catalogoturno.scss';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'turno', headerName: 'Turno', width: 150 },
];

const CatalogoTurno: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    axios.get('http://172.16.10.31/api/Turn')
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className='catalogo-turno'>
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
          Catálogo de Turnos
        </Typography>
      </Box>
      <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
        <DataGrid
          columns={columns}
          rows={rows}
          disableDensitySelector
          disableColumnFilter
          disableColumnSelector
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

export default CatalogoTurno;
