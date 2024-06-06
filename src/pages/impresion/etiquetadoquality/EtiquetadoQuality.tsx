import * as React from 'react';
import { Box, Button, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './etiquetadoquality.scss';

// Dummy data para los dropdowns y campos automáticos
const areaOptions = ['REFILADO', 'BOLSEO', 'IMPRESION', 'POUCH'];
const ptOptions = ['PT00316', 'PT00789'];
const uomOptions = ['PCS', 'BOX', 'PLT'];
const maquinaOptions = ['017 maquina kenworth', '018 maquina ford', '019 maquina toyota'];
const turnoOptions = ['NEGRO', 'VERDE', 'ROJO', 'AZUL'];
const operadorOptions = ['1245 - Maria Lopez Becerrar', '1246 - Juan Perez Martinez', '1247 - Ana Gomez Ruiz'];


const EtiquetadoQuality: React.FC = () => {
  const navigate = useNavigate();
    // Estado para manejar la selección de PT y actualizar otros campos automáticamente
  const [selectedPT, setSelectedPT] = React.useState('');

  // Simular la obtención de información basada en el PT seleccionado
  const itemDescription = selectedPT === 'PT00316' ? 'ROMAINE HEARTS 3CL' : 'PRODUCT XYZ';
  const itemNumber = selectedPT === 'PT00316' ? 'ITEM001' : 'ITEM002';

  return (
    <div className='impresion-container-quality'>
      <IconButton
        onClick={() => navigate('/modulosimpresion')}
        sx={{ position: 'absolute', top: 16, left: 16 }}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box className='impresion-card-destiny'>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          GENERACION ETIQUETA FORMATO QUALITY
        </Typography>
        <Box className='impresion-form-destiny'>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>AREA</MenuItem>
            {areaOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="OT Y/O LOTE" variant="outlined" type="number" />
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>Maquina</MenuItem>
            {maquinaOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select fullWidth value={selectedPT} onChange={(e) => setSelectedPT(e.target.value)} displayEmpty>
            <MenuItem value="" disabled>PRODUCTO</MenuItem>
            {ptOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>Turno</MenuItem>
            {turnoOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <Select fullWidth defaultValue="" displayEmpty>
            <MenuItem value="" disabled>Operador</MenuItem>
            {operadorOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="Peso Bruto" variant="outlined" type="number" />
          <TextField fullWidth label="Peso Neto" variant="outlined" type="number" />
          <TextField fullWidth label="Peso Tarima" variant="outlined" type="number" />
          <TextField fullWidth label="Total Qty/Pallet(Eaches)" variant="outlined" type="number" />
          <TextField fullWidth label="Lot" variant="outlined" type="number" />
          <TextField fullWidth label="TRACEABILITY CODE" variant="outlined" type="number" />
          <TextField fullWidth label="Item" value={itemDescription} InputProps={{ readOnly: true }} />
          <TextField fullWidth label="QPS ITEM#" value={itemNumber} InputProps={{ readOnly: true }} />
        </Box>
        <Box className='impresion-button-destiny'>
          <Button variant="contained" className="generate-button">
            GENERAR ETIQUETA
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default EtiquetadoQuality;
