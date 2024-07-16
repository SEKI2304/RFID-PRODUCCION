import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { IconButton, Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './catalogodestiny.scss';

interface RowData {
  id: number;
  prodEtiquetaRFIDId: number;
  shippingUnits: number;
  uom: string;
  inventoryLot: string;
  individualUnits: number;
  palletId: string;
  customerPo: string;
  totalUnits: number;
  productDescription: string;
  itemNumber: string;
}

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'prodEtiquetaRFIDId', headerName: 'RFID ID', width: 120 },
  { field: 'shippingUnits', headerName: 'Shipping Units', width: 130 },
  { field: 'uom', headerName: 'UOM', width: 100 },
  { field: 'inventoryLot', headerName: 'Inventory Lot', width: 150 },
  { field: 'individualUnits', headerName: 'Individual Units', width: 130 },
  { field: 'palletId', headerName: 'Pallet ID', width: 130 },
  { field: 'customerPo', headerName: 'Customer PO', width: 130 },
  { field: 'totalUnits', headerName: 'Total Units', width: 120 },
  { field: 'productDescription', headerName: 'Product Description', width: 200 },
  { field: 'itemNumber', headerName: 'Item Number', width: 120 }
];

const CatalogoDestiny: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    axios.get('http://172.16.10.31/api/LabelDestiny')
      .then(response => {
        setRows(response.data.map((item: any) => ({
          id: item.id,
          prodEtiquetaRFIDId: item.prodEtiquetaRFIDId,
          shippingUnits: item.shippingUnits,
          uom: item.uom,
          inventoryLot: item.inventoryLot,
          individualUnits: item.individualUnits,
          palletId: item.palletId,
          customerPo: item.customerPo,
          totalUnits: item.totalUnits,
          productDescription: item.productDescription,
          itemNumber: item.itemNumber
        })));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='catalogo-destiny'>
      <IconButton onClick={() => navigate('/catalogos')} sx={{ position: 'absolute', top: 16, left: 16 }}>
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Typography variant="h4" sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
        CATALOGO ETIQUETADO DESTINY
      </Typography>
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
      />
    </div>
  );
};

export default CatalogoDestiny;
