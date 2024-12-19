import * as React from 'react';
import { Box, Grid, Typography, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Link } from 'react-router-dom';
import './modulosregistros.scss';
import FactoryIcon from '@mui/icons-material/Factory';

const RegistroModules = [
  { icon: <CategoryIcon sx={{ fontSize: 60 }} />, label: 'INSUMOS', path: '/Insumos' },
];

const ModulosRegistros: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='modulos-registros'>
      <Box sx={{ width: '100%', p: 1, position: 'relative' }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 10
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
        </IconButton>
        <Box sx={{ pt: 3, width: '100%', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mt: 3 }}> 
            SELECCIONA EL MODULO DE REGISTRO
          </Typography>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={4} justifyContent="center">
          {RegistroModules.map((item, index) => (
            <Grid item key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 250,
                    width: 250,
                    backgroundColor: '#46707e',
                    borderRadius: 2,
                    boxShadow: 3,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#3b5c6b',
                    },
                    mx: 2,
                  }}
                >
                  {item.icon}
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {item.label}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </div>
  );
};

export default ModulosRegistros;
