import React, { useEffect, useState } from 'react';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { IconButton, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import './catalogodestiny.scss';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', maxWidth: 100 },
  { field: 'Area', headerName: 'Area', maxWidth: 150, minWidth: 150},
  { field: 'Fecha', headerName: 'Fecha', maxWidth: 150, minWidth: 150},
  { field: 'ClaveProducto', headerName: 'PT', maxWidth: 120, minWidth:120},
  { field: 'NombreProducto', headerName: 'Nombre Producto', minWidth:500, width: 500},
  { field: 'Turno', headerName: 'Turno', maxWidth: 150 },
  { field: 'Operador', headerName: 'Operador', minWidth: 300, maxWidth: 350},
  { field: 'PesoBruto', headerName: 'Peso Bruto', maxWidth: 150, type:'number'},
  { field: 'PesoNeto', headerName: 'Peso Neto', maxWidth: 150, type:'number'},
  { field: 'PesoTarima', headerName: 'Peso Tarima', maxWidth: 150, type:'number'},
  { field: 'Piezas', headerName: 'Piezas', maxWidth: 150, },
  { field: 'Trazabilidad', headerName: 'Trazabilidad',minWidth:200, maxWidth:200},
  { field: 'Orden', headerName: 'OT Y/O LOTE', maxWidth: 150 },
  { field: 'RFID', headerName: 'RFID',minWidth:200, maxWidth: 200 },
];

const CatalogoDestiny: React.FC = () => {
  const navigate = useNavigate();

  // Define el estado para almacenar los datos de la API
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const response = await axios.get('https://localhost:7204/api/LabelDestiny');
        const data = response.data.map((item: any) => ({
          id: item.id,
          Area: item.prodEtiquetaRFID.area,
          Fecha: item.prodEtiquetaRFID.fecha.split('T')[0], // Asume que la fecha viene en formato ISO y la corta para obtener solo la fecha
          ClaveProducto: item.prodEtiquetaRFID.claveProducto,
          NombreProducto: item.prodEtiquetaRFID.nombreProducto,
          Turno: item.prodEtiquetaRFID.turno,
          Operador: item.prodEtiquetaRFID.operador,
          PesoBruto: item.prodEtiquetaRFID.pesoBruto,
          PesoNeto: item.prodEtiquetaRFID.pesoNeto,
          PesoTarima: item.prodEtiquetaRFID.pesoTarima,
          Piezas: item.prodEtiquetaRFID.piezas,
          Trazabilidad: item.prodEtiquetaRFID.trazabilidad,
          Orden: item.prodEtiquetaRFID.orden,
          RFID: item.prodEtiquetaRFID.rfid,
        }));
        setRows(data);
      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    };

    fetchLabels();
  }, []);

  return (
    <div className='catalogo-destiny'>
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
            CATALOGO ETIQUETADO DESTINY
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
}

export default CatalogoDestiny;
