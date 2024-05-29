import * as React from 'react';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './etiquetadoquality.scss';

interface Option {
  label: string;
  value: string;
}

const areaOptions: Option[] = [
  { label: 'REFILADO', value: 'REFILADO' },
  { label: 'BOLSEO', value: 'BOLSEO' },
  { label: 'IMPRESION', value: 'IMPRESION' },
  { label: 'POUCH', value: 'POUCH' }
];
const ptOptions: Option[] = [
  { label: 'PT00316', value: 'PT00316' },
  { label: 'PT00789', value: 'PT00789' }
];
const uomOptions: Option[] = [
  { label: 'PCS', value: 'PCS' },
  { label: 'BOX', value: 'BOX' },
  { label: 'PLT', value: 'PLT' }
];
const maquinaOptions: Option[] = [
  { label: '017 maquina kenworth', value: '017 maquina kenworth' },
  { label: '018 maquina ford', value: '018 maquina ford' },
  { label: '019 maquina toyota', value: '019 maquina toyota' }
];
const turnoOptions: Option[] = [
  { label: 'NEGRO', value: 'NEGRO' },
  { label: 'VERDE', value: 'VERDE' },
  { label: 'ROJO', value: 'ROJO' },
  { label: 'AZUL', value: 'AZUL' }
];
const operadorOptions: Option[] = [
  { label: '1245 - Maria Lopez Becerrar', value: '1245 - Maria Lopez Becerrar' },
  { label: '1246 - Juan Perez Martinez', value: '1246 - Juan Perez Martinez' },
  { label: '1247 - Ana Gomez Ruiz', value: '1247 - Ana Gomez Ruiz' }
];

const EtiquetadoQuality: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='impresion-container-quality'>
      <IconButton
        onClick={() => navigate('/modulosimpresion')}
        sx={{ position: 'absolute', top: 16, left: 16 }}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box className='impresion-card-quality'>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          GENERACION DE ETIQUETA FORMATO QUALITY
        </Typography>
        <Box className='impresion-form-quality'>
          <Select fullWidth displayEmpty value="" onChange={(e) => {}}>
            <MenuItem value="" disabled>PT</MenuItem>
            {ptOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="Item Description" InputProps={{ readOnly: true }} />
          <Select fullWidth displayEmpty value="" onChange={(e) => {}}>
            <MenuItem value="" disabled>UOM</MenuItem>
            {uomOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          <Select fullWidth displayEmpty value="" onChange={(e) => {}}>
            <MenuItem value="" disabled>Maquina</MenuItem>
            {maquinaOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="Qty/UOM(Eaches)" type="number" variant="outlined" />
          <TextField fullWidth label="Item#" InputProps={{ readOnly: true }} />
          <Select fullWidth displayEmpty value="" onChange={(e) => {}}>
            <MenuItem value="" disabled>Turno</MenuItem>
            {turnoOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          <Select fullWidth displayEmpty value="" onChange={(e) => {}}>
            <MenuItem value="" disabled>Operador</MenuItem>
            {operadorOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="Peso Neto" type="number" variant="outlined" />
          <TextField fullWidth label="Peso Bruto" type="number" variant="outlined" />
          <TextField fullWidth label="Peso Tarima" type="number" variant="outlined" />
          <TextField fullWidth label="Total Piezas" type="number" variant="outlined" />
          <TextField fullWidth label="Shipping Units/Pallet" type="number" variant="outlined" />
          <TextField fullWidth label="OT Y/O LOTE" type="number" variant="outlined" />
          <TextField fullWidth label="Inventory Lot" type="number" variant="outlined" />
        </Box>
        <Box className='impresion-button-quality'>
          <Button variant="contained" className="generate-button">
            GENERAR ETIQUETA
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default EtiquetadoQuality;
