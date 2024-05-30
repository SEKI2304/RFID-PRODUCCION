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
import './catalogomaquina.scss';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', maxWidth: 100 },
  { field: 'area', headerName: 'Area', maxWidth: 150, minWidth: 150 },
  { field: 'no', headerName: 'No', maxWidth: 150, minWidth: 150 },
  { field: 'maquina', headerName: 'Maquina', maxWidth: 200, minWidth: 200 },
  { field: 'nombre', headerName: 'Nombre', minWidth: 500, width: 500 },
  { field: 'status', headerName: 'Status', maxWidth: 150 },
];

const CatalogoMaquina: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    axios
      .get('https://localhost:7204/api/Machine')
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className='catalogo-maquina'>
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
          CATALOGO MAQUINA
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

export default CatalogoMaquina;

