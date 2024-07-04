import React, { useEffect, useState } from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  DataGrid,
  GridToolbar,
  GridRowsProp,
  GridColDef,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import './catalogoarea.scss';

// Definición de las columnas del DataGrid
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', maxWidth: 100 },
  { field: 'area', headerName: 'Área', flex: 1 },
];

const CatalogoArea: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://172.16.10.31/api/Area', {
          headers: {
            'Accept': 'application/json'
          }
        });
        const newRows = response.data.map((item: any) => ({
          id: item.id,
          area: item.area
        }));
        setRows(newRows);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='catalogo-area'>
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
          Catálogo de Áreas
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
        />
      </Box>
    </div>
  );
};

export default CatalogoArea;


