import { IconButton, Box, Typography } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './catalogobfx.scss';
import {
  DataGrid,
  GridToolbar,
  GridRowsProp,
  GridColDef,
  GridFilterModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 150 },
  { field: 'age', headerName: 'Age', type: 'number' },
];

const rows: GridRowsProp = [
  { id: 1, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 2, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 3, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 4, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 5, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 6, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 7, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 8, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 9, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 10, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 11, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 12, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
  { id: 13, name: "El nombre que se va a usar para el ejempo", email: "eldummydata@gmail.com", age: 25 },
];

const CatalogoBFX: React.FC = () => {
  const navigate =useNavigate();
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
    items: [],
    quickFilterExcludeHiddenColumns: true,
    quickFilterValues: ['1'],
  });

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({});

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
          rows={rows}
          disableColumnFilter
          disableDensitySelector
          slots={{ toolbar: GridToolbar }}
          filterModel={filterModel}
          onFilterModelChange={(newModel) => setFilterModel(newModel)}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) =>
            setColumnVisibilityModel(newModel)
          }
        />
      </Box>
    </div>
  )
}

export default CatalogoBFX
