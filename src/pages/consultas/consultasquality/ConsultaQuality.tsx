import React, { useEffect, useState } from 'react';
import { IconButton, Box, Typography, Modal, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import './consultaquality.scss';
import axios from 'axios';

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
  individualUnits: number;
  itemDescription: string;
  itemNumber: string;
  totalUnits: number;
  shippingUnits: number;
  inventoryLot: string;
  customer: string;
  traceability: string;
  prodEtiquetaRFIDId: number;
}


const ConsultaQuality: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  
  useEffect(() => {
    axios.get('http://172.16.10.31/api/LabelQuality')
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
          individualUnits: item.prodExtrasQuality.individualUnits,
          itemDescription: item.prodExtrasQuality.itemDescription,
          itemNumber: item.prodExtrasQuality.itemNumber,
          totalUnits: item.prodExtrasQuality.totalUnits,
          shippingUnits: item.prodExtrasQuality.shippingUnits,
          inventoryLot: item.prodExtrasQuality.inventoryLot,
          customer: item.prodExtrasQuality.customer,
          traceability: item.prodExtrasQuality.traceability,
          prodEtiquetaRFIDId: item.prodExtrasQuality.prodEtiquetaRFIDId,
          claveUnidad: item.claveUnidad
        })));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'customer', headerName: 'Customer', width: 250 },
    { field: 'itemDescription', headerName: 'Item Description', width: 400 },
    { field: 'itemNumber', headerName: 'Item Number', width: 150 },
    { field: 'inventoryLot', headerName: 'Inventory Lot', width: 150 },
    { field: 'traceability', headerName: 'Traceability', width: 200 },
    { field: 'individualUnits', headerName: 'Individual Units', type: 'number', width: 150 },
    { field: 'totalUnits', headerName: 'Total Units', type: 'number', width: 150 },
    { field: 'shippingUnits', headerName: 'Shipping Units', type: 'number', width: 100 },
    { field: 'prodEtiquetaRFIDId', headerName: 'RFID', type: 'number', width: 300 },
  ];
  
  return (
    <div className='consulta-quality'>
      <IconButton onClick={() => navigate('/Consultas')} className="back-button">
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Typography variant="h4" className="title">
        CONSULTA PT QUALITY
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

export default ConsultaQuality;
