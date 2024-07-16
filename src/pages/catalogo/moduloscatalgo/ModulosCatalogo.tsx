import * as React from 'react';
import { Box, Grid, Typography, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListAltIcon from '@mui/icons-material/ListAlt';

import './moduloscatalogo.scss';

const catalogModules = [
  { icon: <BusinessIcon sx={{ fontSize: 40 }} />, label: 'PRODUCTO BIOFLEX', path: '/catalogoBioflex' },
  { icon: <BusinessIcon sx={{ fontSize: 40 }} />, label: 'PRODUCTO DESTINY', path: '/catalogoDestiny' },
  { icon: <BusinessIcon sx={{ fontSize: 40 }} />, label: 'PRODUCTO QUALITY', path: '/catalogoQuality' },
  { icon: <EngineeringIcon sx={{ fontSize: 40 }} />, label: 'AREA', path: '/catalogoArea' },
  { icon: <EngineeringIcon sx={{ fontSize: 40 }} />, label: 'MAQUINA', path: '/catalogoMaquina' },
  { icon: <PeopleIcon sx={{ fontSize: 40 }} />, label: 'OPERADORES', path: '/catalogoOperadores' },
  { icon: <AccessTimeIcon sx={{ fontSize: 40 }} />, label: 'TURNO', path: '/catalogoTurno' },
  { icon: <ListAltIcon sx={{ fontSize: 40 }} />, label: 'ÓRDENES', path: '/catalogoOrdenes' }
];

const ModulosCatalogo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='modulos-catalogo'>
      <IconButton
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', mt: 4, mb: 4 }}>
            SELECCIONA UN CATALGOO
        </Typography>
      </Box>
      <Box>
        <Grid container spacing={4} justifyContent="center">
            {catalogModules.map((module, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <Button
                fullWidth
                variant="contained"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                    backgroundColor: '#46707e',
                    borderRadius: 2,
                    boxShadow: 3,
                    color: 'white',
                    '&:hover': {
                    backgroundColor: '#3b5c6b',
                    },
                }}
                onClick={() => navigate(module.path)}
                >
                {module.icon}
                <Typography variant="h6" sx={{ mt: 2 }}>
                    {module.label}
                </Typography>
                </Button>
            </Grid>
            ))}
        </Grid>
      </Box>
    </div>
  );
};

export default ModulosCatalogo;
