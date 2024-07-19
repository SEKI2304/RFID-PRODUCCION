import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import './catalogodestiny.scss';


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
  uom: string;
  prodEtiquetaRFIDId: number;
  shippingUnits: number;
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
  { field: 'itemNumber', headerName: 'Item Number', width: 120 },
  {
    field: 'acciones',
    headerName: 'Acciones',
    sortable: false,
    filterable: false,
    width: 150,
    renderCell: (params) => (
      <>
        <IconButton onClick={() => handlePrintClick(params.row, 'http://172.16.10.31/Printer/DestinyPrinterIP?ip=172.16.20.58')}>
          <PrintIcon />
        </IconButton>
      </>
    ),
  }
];

const handlePrintClick = (row: RowData, url: string) => {
  const postData = {
    area: row.area,
    claveProducto: row.claveProducto,
    nombreProducto: row.nombreProducto,
    claveOperador: row.claveOperador,
    operador: row.operador,
    turno: row.turno,
    pesoTarima: row.pesoTarima,
    pesoBruto: row.pesoBruto,
    pesoNeto: row.pesoNeto,
    piezas: row.piezas,
    trazabilidad: row.trazabilidad,
    orden: row.orden.toString(),
    rfid: row.rfid,
    status: row.status,
    fecha: row.fecha,
    postExtraDestinyDto: {
      shippingUnits: row.shippingUnits,
      uom: row.uom,
      inventoryLot: row.inventoryLot,
      individualUnits: row.individualUnits,
      palletId: row.palletId,
      customerPo: row.customerPo,
      totalUnits: row.totalUnits,
      productDescription: row.productDescription,
      itemNumber: row.itemNumber
    }
  };

  axios.post(url, postData)
    .then(response => {
      console.log('Impresión iniciada:', response.data);
      // Puedes manejar la respuesta de éxito aquí, como mostrar un mensaje de éxito.
    })
    .catch(error => {
      console.error('Error al imprimir:', error);
      // Puedes manejar errores aquí, como mostrar un mensaje de error.
    });
};


const CatalogoDestiny: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);

  useEffect(() => {
    axios.get('http://172.16.10.31/api/LabelDestiny')
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
          prodEtiquetaRFIDId: item.prodExtrasDestiny.prodEtiquetaRFIDId,
          shippingUnits: item.prodExtrasDestiny.shippingUnits,
          inventoryLot: item.prodExtrasDestiny.inventoryLot,
          individualUnits: item.prodExtrasDestiny.individualUnits,
          palletId: item.prodExtrasDestiny.palletId,
          customerPo: item.prodExtrasDestiny.customerPo,
          totalUnits: item.prodExtrasDestiny.totalUnits,
          productDescription: item.prodExtrasDestiny.productDescription,
          itemNumber: item.prodExtrasDestiny.itemNumber
        })));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='catalogo-destiny'>
      <IconButton onClick={() => navigate('/catalogos')} className="back-button">
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Typography variant="h4" className="title">
        CATALOGO ETIQUETADO DESTINY
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
          pageSizeOptions={[5,10,25,50,100]}
          pagination
          className="MuiDataGrid-root"
        />
      </div>
    </div>
  );
};

export default CatalogoDestiny;
