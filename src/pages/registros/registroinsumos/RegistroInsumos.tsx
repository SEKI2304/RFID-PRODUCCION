import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button, Modal, TextField, Grid, Autocomplete } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios'; 
import Swal from 'sweetalert2';
import './registroinsumos.scss';

const PASSWORD = 'AlmacenRBfx$';

// Interfaz para los registros
interface RegistroInsumo {
  id: number;
  fechaCambio: string;
  insumo: string;
  codigoInsumo: string;
  cantidad: number;
  tipoMovimiento: string;
  operador: string;
  usuarioRegistro: string;
  impresora: string;
  observaciones: string;
  estado: string;
  ubicacion: string;
  fechaUltimaModificacion: string;
}

interface InsumoEstado {
  insumo: string; // Nombre del insumo (Etiquetas, Tinta, etc.)
  totalCantidad: number; // Total disponible del insumo
}

const RegistroInsumos: React.FC = () => {
  const [accessGranted, setAccessGranted] = useState(false); // Estado para controlar acceso
  const [password, setPassword] = useState(''); // Contraseña ingresada
  const [openPasswordModal, setOpenPasswordModal] = useState(true); // Controlar la modal de contraseña

  const [openModal, setOpenModal] = useState(false);
  const [date, setDate] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [operator, setOperator] = useState('');
  const [codigoInsumo, setCodigoInsumo] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [tipoMovimiento, setTipoMovimiento] = useState<'Alta' | 'Baja'>('Alta'); // Gestión de llegada o solicitud
  const [observaciones, setObservaciones] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [records, setRecords] = useState<RegistroInsumo[]>([]);
  const [estadoInsumos, setEstadoInsumos] = useState<InsumoEstado[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessGranted) {
      // Si no se ha autorizado el acceso, bloqueamos cualquier acción
      return;
    }

    const fetchData = async () => {
      try {
        // Cargar los registros
        const registrosResponse = await axios.get('http://172.16.10.31/api/RegistroInsumos');
        setRecords(registrosResponse.data);

        // Cargar el estado de los insumos
        const estadoResponse = await axios.get<InsumoEstado[]>('http://172.16.10.31/api/RegistroInsumos/GetInsumosEstado');
        setEstadoInsumos(estadoResponse.data);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, [accessGranted]); // Solo se ejecuta si el acceso está permitido

  const handlePasswordSubmit = () => {
    if (password === PASSWORD) {
      setAccessGranted(true);
      setOpenPasswordModal(false);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña Incorrecta',
        text: 'No tienes acceso a esta vista.',
      });
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleCreateRecord = async () => {
    if (!selectedItem) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Insumo" es obligatorio.',
      });
      return;
    }
    if (!codigoInsumo) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Código de Insumo" es obligatorio.',
      });
      return;
    }
    if (cantidad <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Cantidad" debe ser mayor a 0.',
      });
      return;
    }
    if (!operator) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Operador" es obligatorio.',
      });
      return;
    }
    if (!selectedPrinter) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El campo "Impresora" es obligatorio.',
      });
      return;
    }
  
    // Datos a enviar
    const newRecord = {
      fechaCambio: date || new Date().toISOString().slice(0, 10), // Formato de fecha por defecto
      insumo: selectedItem,
      codigoInsumo,
      cantidad,
      tipoMovimiento,
      operador: operator,
      usuarioRegistro: 'Almacen',
      observaciones: observaciones || '', // Default vacío si no se especifica
      estado: 'Activo',
      ubicacion: ubicacion || 'Sin especificar', // Default si no se proporciona ubicación
      impresora: selectedPrinter,
      fechaUltimaModificacion: new Date().toISOString(),
    };
  
    console.log('Datos enviados al backend:', newRecord); // Verificar los datos enviados
  
    // Intentar enviar los datos al backend
    try {
      const response = await axios.post('http://172.16.10.31/api/RegistroInsumos', newRecord);
  
      // Actualizar la tabla
      setRecords([...records, response.data]);
  
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Registro de insumo ${tipoMovimiento === 'Alta' ? 'agregado' : 'solicitado'} exitosamente.`,
      });
  
      handleCloseModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Manejo de errores específicos de Axios
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.title || 'Hubo un error al procesar el registro.',
        });
        console.error('Error de Axios:', error.response?.data);
      } else {
        // Manejo de otros errores
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        });
        console.error('Error desconocido:', error);
      }
    }
  };

  const columns = [
    { field: 'fechaCambio', headerName: 'Fecha', width: 150 },
    { field: 'insumo', headerName: 'Insumo', width: 150 },
    { field: 'codigoInsumo', headerName: 'Código Insumo', width: 150 },
    { field: 'cantidad', headerName: 'Cantidad', width: 100 },
    { field: 'tipoMovimiento', headerName: 'Movimiento', width: 100 },
    { field: 'observaciones', headerName: 'Observaciones', width: 200 },
    { field: 'ubicacion', headerName: 'Ubicación', width: 150 },
    { field: 'operador', headerName: 'Operador', width: 200 },
  ];

  return (
    <div className='registro-insumos'>

<Modal open={openPasswordModal} sx={{ zIndex: 1050 }}>
        <Box className="modal-content" sx={{ textAlign: 'center', padding: 3 }}>
          <Typography variant="h6">Ingresa la contraseña para acceder</Typography>
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <Button
            variant="contained"
            sx={{ marginTop: 2, backgroundColor: '#46707e', color: 'white' }}
            onClick={handlePasswordSubmit}
          >
            Acceder
          </Button>
        </Box>
      </Modal>
      {accessGranted && (
        <>
          <IconButton onClick={() => navigate('/ModulosRegistros')} className='back-button'>
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>

      <Box className='title'>
        <Typography variant="h4">Registro de Insumos</Typography>
      </Box>

      <Box className='data-grid-container'>
        <Button variant="contained" onClick={handleOpenModal} className='add-button'>
          Registrar Movimiento de Insumo
        </Button>
        <DataGrid
          columns={columns}
          rows={records}
          getRowId={(row) => row.id}
          disableColumnFilter
          disableDensitySelector
          disableColumnSelector
          slots={{ toolbar: GridToolbar }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
        />

<Box className="estado-insumos">
  <Typography variant="h5" className="estado-insumos-title">
    Estado Actual de Insumos
  </Typography>
  {estadoInsumos.length > 0 ? (
    <Grid container spacing={3} className="estado-insumos-grid">
      {estadoInsumos.map((insumo) => (
        <Grid item xs={12} sm={6} md={4} key={insumo.insumo}>
          <Box className="estado-insumo-item">
            <Typography className="estado-insumo-nombre">{insumo.insumo}</Typography>
            <Typography className="estado-insumo-cantidad">Total: {insumo.totalCantidad}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  ) : (
    <Typography className="estado-insumos-vacio">
      No hay datos de insumos disponibles.
    </Typography>
  )}
</Box>
      </Box>

     

      <Modal open={openModal} onClose={handleCloseModal} sx={{ zIndex: 1050 }}>
        <Box className="modal-content" > {/* Z-index agregado */}
          <Typography variant="h6" className="modal-header">
            Registrar Movimiento de Insumo
          </Typography>
          <Grid container spacing={2} sx={{ marginTop: "20px" }}>
            {/* Fecha */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                value={date || new Date().toISOString().slice(0, 10)} // Fecha por defecto
                onChange={(event) => setDate(event.target.value)}
                label="Fecha"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Movimiento */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={tipoMovimiento}
                onChange={(event, newValue) =>
                  setTipoMovimiento((newValue as "Alta" | "Baja") || "Alta")
                }
                options={["Alta", "Baja"]}
                renderInput={(params) => <TextField {...params} label="Movimiento" fullWidth />}
              />
            </Grid>

            {/* Insumo */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={selectedItem}
                onChange={(event, newValue) => {
                  setSelectedItem(newValue || "");
                  if (newValue === "Etiquetas") {
                    setCodigoInsumo("001");
                  } else if (newValue === "Tinta") {
                    setCodigoInsumo("002");
                  } else {
                    setCodigoInsumo(""); // Limpia el código si no hay selección válida
                  }
                }}
                options={["Etiquetas", "Tinta"]}
                renderInput={(params) => <TextField {...params} label="Insumo" fullWidth />}
              />
            </Grid>

            {/* Código de Insumo */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Código de Insumo"
                value={codigoInsumo}
                disabled // Deshabilitado porque se genera automáticamente
                fullWidth
              />
            </Grid>

            {/* Operador */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Operador"
                value={operator}
                onChange={(event) => setOperator(event.target.value)}
                fullWidth
              />
            </Grid>

            {/* Impresora */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                value={selectedPrinter}
                onChange={(event, newValue) => setSelectedPrinter(newValue || '')}
                options={['Impresora 1', 'Impresora 2', 'Impresora 3']}
                renderInput={(params) => <TextField {...params} label="Impresora" fullWidth />}
              />
            </Grid>

            {/* Cantidad */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cantidad"
                type="number"
                value={cantidad}
                onChange={(event) => setCantidad(Number(event.target.value))}
                fullWidth
              />
            </Grid>

            {/* Ubicación */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ubicación"
                value={ubicacion}
                onChange={(event) => setUbicacion(event.target.value)}
                fullWidth
              />
            </Grid>

            {/* Observaciones */}
            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
                fullWidth
                multiline
              />
            </Grid>
          </Grid>

          {/* Footer */}
          <Box className="modal-footer">
            <Button onClick={handleCloseModal} sx={{ color: "red" }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateRecord}
              sx={{ backgroundColor: "#46707e", color: "white" }}
            >
              Guardar
            </Button>
          </Box>
        </Box>
      </Modal>
        </>
      )}
    </div>
  );
};

export default RegistroInsumos;