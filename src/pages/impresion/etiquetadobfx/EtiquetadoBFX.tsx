import * as React from 'react';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './etiquetadobfx.scss';

const areaOptions = ['REFILADO', 'BOLSEO', 'IMPRESION', 'POUCH'];
const maquinaOptions = ['017 maquina kenworth', '018 maquina ford', '019 maquina toyota'];
const productoOptions = ['Producto A', 'Producto B', 'Producto C'];
const turnoOptions = ['NEGRO', 'VERDE', 'ROJO', 'AZUL'];
const operadorOptions = ['1245 - Maria Lopez Becerrar', '1246 - Juan Perez Martinez', '1247 - Ana Gomez Ruiz'];

const EtiquetadoBFX: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='impresion-container-bfx'>
      <IconButton
        onClick={() => navigate('/modulosimpresion')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box className='impresion-card-bfx'>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          Generar Etiqueta
        </Typography>
        <Box className='impresion-form-bfx'>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>AREA</MenuItem>
            {areaOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="OT Y/O LOTE" variant="outlined" type="number" />
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>MAQUINA</MenuItem>
            {maquinaOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>PRODUCTO</MenuItem>
            {productoOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>TURNO</MenuItem>
            {turnoOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>OPERADOR</MenuItem>
            {operadorOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="PESO BRUTO" variant="outlined" type="number" />
          <TextField fullWidth label="PESO NETO" variant="outlined" type="number" />
          <TextField fullWidth label="PESO TARIMA" variant="outlined" type="number" />
          <TextField fullWidth label="# Piezas (Rollos, Bultos, Cajas)" variant="outlined" type="number" /> {/* Nuevo campo agregado */}
        </Box>
        <Box className='impresion-button-bfx'>
          <Button variant="contained" className="generate-button">
            GENERAR ETIQUETA
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default EtiquetadoBFX;
