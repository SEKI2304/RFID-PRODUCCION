import {
  DataGrid,
  GridToolbar,
  GridRowsProp,
  GridColDef,

  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import { IconButton, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './catalogoquality.scss'
import React, { useEffect, useState } from 'react';


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

const rows: GridRowsProp = [
  { id: 1, Area: 'Producción', Fecha: '2024-01-15', ClaveProducto: 'P12345', NombreProducto: 'Producto A', Turno: 'Mañana', Operador: 'Juan Pérez', PesoBruto: 1500.5, PesoNeto: 1400.3, PesoTarima: 100.2, Piezas: 50, Trazabilidad: '1234567890123', Orden: 'OT1234', RFID: '0021234567890123' },
  { id: 2, Area: 'Empaque', Fecha: '2024-01-16', ClaveProducto: 'P67890', NombreProducto: 'Producto B', Turno: 'Tarde', Operador: 'Ana Gómez', PesoBruto: 2000.7, PesoNeto: 1800.6, PesoTarima: 200.1, Piezas: 60, Trazabilidad: '2345678901234', Orden: 'OT5678', RFID: '0022345678901234' },
  { id: 3, Area: 'Calidad', Fecha: '2024-01-17', ClaveProducto: 'P11223', NombreProducto: 'Producto C', Turno: 'Noche', Operador: 'Carlos López', PesoBruto: 1800.3, PesoNeto: 1700.4, PesoTarima: 99.9, Piezas: 55, Trazabilidad: '3456789012345', Orden: 'OT9101', RFID: '0023456789012345' },
  { id: 4, Area: 'Producción', Fecha: '2024-01-18', ClaveProducto: 'P44556', NombreProducto: 'Producto D', Turno: 'Mañana', Operador: 'María Torres', PesoBruto: 2200.8, PesoNeto: 2100.5, PesoTarima: 100.3, Piezas: 70, Trazabilidad: '4567890123456', Orden: 'OT1121', RFID: '0024567890123456' },
  { id: 5, Area: 'Empaque', Fecha: '2024-01-19', ClaveProducto: 'P77889', NombreProducto: 'Producto E', Turno: 'Tarde', Operador: 'Luis Fernández', PesoBruto: 2500.2, PesoNeto: 2400.4, PesoTarima: 99.8, Piezas: 75, Trazabilidad: '5678901234567', Orden: 'OT3141', RFID: '0025678901234567' },
  { id: 6, Area: 'Calidad', Fecha: '2024-01-20', ClaveProducto: 'P99001', NombreProducto: 'Producto F', Turno: 'Noche', Operador: 'Elena Martínez', PesoBruto: 1600.6, PesoNeto: 1500.3, PesoTarima: 100.3, Piezas: 65, Trazabilidad: '6789012345678', Orden: 'OT5161', RFID: '0026789012345678' },
  { id: 7, Area: 'Producción', Fecha: '2024-01-21', ClaveProducto: 'P22334', NombreProducto: 'Producto G', Turno: 'Mañana', Operador: 'Miguel García', PesoBruto: 2100.9, PesoNeto: 2000.4, PesoTarima: 100.5, Piezas: 80, Trazabilidad: '7890123456789', Orden: 'OT7181', RFID: '0027890123456789' },
  { id: 8, Area: 'Empaque', Fecha: '2024-01-22', ClaveProducto: 'P55667', NombreProducto: 'Producto H', Turno: 'Tarde', Operador: 'Sofía Ramírez', PesoBruto: 2700.1, PesoNeto: 2600.8, PesoTarima: 99.3, Piezas: 85, Trazabilidad: '8901234567890', Orden: 'OT9201', RFID: '0028901234567890' },
  { id: 9, Area: 'Calidad', Fecha: '2024-01-23', ClaveProducto: 'P88990', NombreProducto: 'Producto I', Turno: 'Noche', Operador: 'José Sánchez', PesoBruto: 2300.4, PesoNeto: 2200.5, PesoTarima: 100.1, Piezas: 90, Trazabilidad: '9012345678901', Orden: 'OT1222', RFID: '0029012345678901' },
  { id: 10, Area: 'Producción', Fecha: '2024-01-24', ClaveProducto: 'P11212', NombreProducto: 'Producto J', Turno: 'Mañana', Operador: 'Patricia Castillo', PesoBruto: 2900.3, PesoNeto: 2800.6, PesoTarima: 99.7, Piezas: 95, Trazabilidad: '0123456789012', Orden: 'OT3242', RFID: '0020123456789012' },
  { id: 11, Area: 'Empaque', Fecha: '2024-01-25', ClaveProducto: 'P33435', NombreProducto: 'Producto K', Turno: 'Tarde', Operador: 'Fernando Ruiz', PesoBruto: 3000.2, PesoNeto: 2900.4, PesoTarima: 99.8, Piezas: 100, Trazabilidad: '1234567890123', Orden: 'OT5262', RFID: '0021234567890123' },
  { id: 12, Area: 'Calidad', Fecha: '2024-01-26', ClaveProducto: 'P55658', NombreProducto: 'Producto L', Turno: 'Noche', Operador: 'Gabriela Vargas', PesoBruto: 3100.5, PesoNeto: 3000.3, PesoTarima: 100.2, Piezas: 105, Trazabilidad: '2345678901234', Orden: 'OT7282', RFID: '0022345678901234' },
  { id: 13, Area: 'Producción', Fecha: '2024-01-27', ClaveProducto: 'P77881', NombreProducto: 'Producto M', Turno: 'Mañana', Operador: 'Alberto Ortega', PesoBruto: 3200.6, PesoNeto: 3100.4, PesoTarima: 100.2, Piezas: 110, Trazabilidad: '3456789012345', Orden: 'OT9302', RFID: '0023456789012345' },
  { id: 14, Area: 'Empaque', Fecha: '2024-01-28', ClaveProducto: 'P99004', NombreProducto: 'Producto N', Turno: 'Tarde', Operador: 'Beatriz Morales', PesoBruto: 3300.7, PesoNeto: 3200.5, PesoTarima: 100.2, Piezas: 115, Trazabilidad: '4567890123456', Orden: 'OT1323', RFID: '0024567890123456' },
  { id: 15, Area: 'Calidad', Fecha: '2024-01-29', ClaveProducto: 'P22337', NombreProducto: 'Producto O', Turno: 'Noche', Operador: 'Diego Martínez', PesoBruto: 3400.8, PesoNeto: 3300.6, PesoTarima: 100.2, Piezas: 120, Trazabilidad: '5678901234567', Orden: 'OT3343', RFID: '0025678901234567' },
  { id: 16, Area: 'Producción', Fecha: '2024-01-30', ClaveProducto: 'P44560', NombreProducto: 'Producto P', Turno: 'Mañana', Operador: 'Laura Pérez', PesoBruto: 3500.9, PesoNeto: 3400.7, PesoTarima: 100.2, Piezas: 125, Trazabilidad: '6789012345678', Orden: 'OT5363', RFID: '0026789012345678' },
  { id: 17, Area: 'Empaque', Fecha: '2024-01-31', ClaveProducto: 'P66883', NombreProducto: 'Producto Q', Turno: 'Tarde', Operador: 'Marcela Torres', PesoBruto: 3600.1, PesoNeto: 3500.8, PesoTarima: 100.2, Piezas: 130, Trazabilidad: '7890123456789', Orden: 'OT7383', RFID: '0027890123456789' },
  { id: 18, Area: 'Calidad', Fecha: '2024-02-01', ClaveProducto: 'P89006', NombreProducto: 'Producto R', Turno: 'Noche', Operador: 'Raúl Gutiérrez', PesoBruto: 3700.2, PesoNeto: 3600.9, PesoTarima: 100.2, Piezas: 135, Trazabilidad: '8901234567890', Orden: 'OT9403', RFID: '0028901234567890' },
  { id: 19, Area: 'Producción', Fecha: '2024-02-02', ClaveProducto: 'P11229', NombreProducto: 'Producto S', Turno: 'Mañana', Operador: 'Natalia López', PesoBruto: 3800.3, PesoNeto: 3700.4, PesoTarima: 100.2, Piezas: 140, Trazabilidad: '9012345678901', Orden: 'OT1424', RFID: '0029012345678901' },
  { id: 20, Area: 'Empaque', Fecha: '2024-02-03', ClaveProducto: 'P33452', NombreProducto: 'Producto T', Turno: 'Tarde', Operador: 'Rafael Méndez', PesoBruto: 3900.4, PesoNeto: 3800.5, PesoTarima: 100.2, Piezas: 145, Trazabilidad: '0123456789012', Orden: 'OT3444', RFID: '0020123456789012' }
];

const CatalogoQuality: React.FC = () => {
  const navigate =useNavigate();
  

  const [columnVisibilityModel, setColumnVisibilityModel] =
    React.useState<GridColumnVisibilityModel>({});

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
            CATALOGO ETIQUETADO QUALITY
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
  )  
}

export default CatalogoQuality