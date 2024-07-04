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
  prodEtiquetaRFIDId: number;
  individualUnits: number;
  itemDescription: string;
  itemNumber: string;
  totalUnits: number;
  shippingUnits: number;
  inventoryLot: string;
  customer: string;
  traceability: string;
}

const CatalogoQuality: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  useEffect(() => {
    axios.get('http://172.16.10.31/api/LabelQuality')
      .then(response => setRows(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handlePreviewClick = (row: RowData) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const handlePrintClick = (row: RowData) => {
    axios.post(`http://172.16.10.31/Printer/SendSATOCommandNoSave`, row)
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
    { field: 'prodEtiquetaRFIDId', headerName: 'RFID',type: 'number', width: 300 },
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
      <IconButton onClick={() => navigate('/catalogos')} sx={{ position: 'absolute', top: 16, left: 16 }}>
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Typography variant="h4" sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
        CATALOGO ETIQUETADO QUALITY
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
                pageSize: 10,
              },
            },
        }}
        pageSizeOptions={[5,10,25]}
        pagination
      />
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
                        <Typography><strong>Shipping Units:</strong> {selectedRow.prodEtiquetaRFIDId}</Typography>
                    </div>
                </Box>
            )}
        </Paper>
    </Modal>

    </div>
  );
};

export default CatalogoQuality;
