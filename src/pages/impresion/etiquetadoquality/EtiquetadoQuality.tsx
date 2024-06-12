import * as React from 'react';
import { Box, Button, IconButton, MenuItem, TextField, Typography, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './etiquetadoquality.scss';

// Dummy data para los dropdowns y campos automáticos
const areaOptions = ['REFILADO', 'BOLSEO', 'IMPRESION', 'POUCH'];
const ptOptions = ['PT00316', 'PT00789'];
const maquinaOptions = ['017 maquina kenworth', '018 maquina ford', '019 maquina toyota'];
const turnoOptions = ['NEGRO', 'VERDE', 'ROJO', 'AZUL'];
const operadorOptions = ['1245 - Maria Lopez Becerrar', '1246 - Juan Perez Martinez', '1247 - Ana Gomez Ruiz'];

const EtiquetadoQuality: React.FC = () => {
  const navigate = useNavigate();
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
          <Autocomplete
            options={areaOptions}
            renderInput={(params) => <TextField {...params} label="AREA" variant="outlined" />}
          />
          <TextField fullWidth label="OT Y/O LOTE" variant="outlined" type="number" />
          <Autocomplete
            options={maquinaOptions}
            renderInput={(params) => <TextField {...params} label="Maquina" variant="outlined" />}
          />
          <Autocomplete
            options={ptOptions}
            value={selectedPT}
            onChange={(event, newValue) => setSelectedPT(newValue || '')}
            renderInput={(params) => <TextField {...params} label="PRODUCTO" variant="outlined" />}
          />
          <Autocomplete
            options={turnoOptions}
            renderInput={(params) => <TextField {...params} label="Turno" variant="outlined" />}
          />
          <Autocomplete
            options={operadorOptions}
            renderInput={(params) => <TextField {...params} label="Operador" variant="outlined" />}
          />
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
