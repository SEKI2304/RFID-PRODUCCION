import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IconButton, Box, Typography, Modal, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid, GridToolbar, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import './catalogoquality.scss';

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

const CatalogoQuality: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

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


  const handlePreviewClick = (row: RowData) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const handlePrintClick = (row: RowData) => {
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
      orden: row.orden,
      rfid: row.rfid,
      status: row.status,
      fecha: row.fecha,
      postExtraQuality: {
        individualUnits: row.individualUnits,
        itemDescription: row.itemDescription,
        itemNumber: row.itemNumber,
        totalUnits: row.totalUnits,
        shippingUnits: row.shippingUnits,
        inventoryLot: row.inventoryLot,
        customer: row.customer,
        traceability: row.traceability
      },
    };

    axios.post(`http://172.16.10.31/Printer/QualityPrinterIP?ip=172.16.20.58`, postData)
      .then(response => console.log('Impresión iniciada:', response.data))
      .catch(error => console.error('Error al imprimir:', error));
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

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
    {
      field: 'acciones',
      headerName: 'Acciones',
      sortable: false,
      filterable: false,
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handlePreviewClick(params.row)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton onClick={() => handlePrintClick(params.row)}>
            <PrintIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div className='catalogo-quality'>
      <IconButton onClick={() => navigate('/catalogos')} className="back-button">
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Typography variant="h4" className="title">
        CATALOGO ETIQUETADO QUALITY
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
      <Modal open={openModal} onClose={handleCloseModal}>
        <Paper className="quality-modal-content">
          <Box className="quality-modal-header">
            <Typography variant="h6">Vista Previa de la Etiqueta</Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          {selectedRow && (
            <Box className="quality-modal-body">
              <div className="row">
                <Typography><strong>Customer:</strong> {selectedRow.customer}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Item Description:</strong> {selectedRow.itemDescription}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Item Number:</strong> {selectedRow.itemNumber}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Inventory Lot:</strong> {selectedRow.inventoryLot}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Traceability:</strong> {selectedRow.traceability}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Individual Units:</strong> {selectedRow.individualUnits}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Total Units:</strong> {selectedRow.totalUnits}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Shipping Units:</strong> {selectedRow.shippingUnits}</Typography>
              </div>
              <div className="row">
                <Typography><strong>RFID:</strong> {selectedRow.prodEtiquetaRFIDId}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Area:</strong> {selectedRow.area}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Fecha:</strong> {selectedRow.fecha}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Clave Producto:</strong> {selectedRow.claveProducto}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Nombre Producto:</strong> {selectedRow.nombreProducto}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Clave Operador:</strong> {selectedRow.claveOperador}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Operador:</strong> {selectedRow.operador}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Turno:</strong> {selectedRow.turno}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Peso Tarima:</strong> {selectedRow.pesoTarima}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Peso Bruto:</strong> {selectedRow.pesoBruto}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Peso Neto:</strong> {selectedRow.pesoNeto}</Typography>
              </div>
              <div className="row">
                <Typography><strong>Piezas:</strong> {selectedRow.piezas}</Typography>
              </div>
              <div className="row">
                <Typography><strong>RFID:</strong> {selectedRow.rfid}</Typography>
              </div>
            </Box>
          )}
        </Paper>
      </Modal>
    </div>
  );
};

export default CatalogoQuality;
