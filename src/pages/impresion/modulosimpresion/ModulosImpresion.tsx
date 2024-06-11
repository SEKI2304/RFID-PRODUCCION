import * as React from 'react';
import { Box, Grid, Typography, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BioflexImage from '../../../assets/bioflex.png';
import DestinyImage from '../../../assets/destiny.png'; 
import QualityImage from '../../../assets/quality.png';
import ReymaImage from '../../../assets/Reyma.png';
import './modulosimpresion.scss';

const modules = [
  { image: BioflexImage, label: 'BIOFLEX', path: '/impresionBFX' },
  { image: DestinyImage, label: 'DESTINY', path: '/impresionDestiny' },
  { image: QualityImage, label: 'QUALITY', path: '/impresionQuality' },
  { image: ReymaImage, label: 'VASO', path: '/impresionVaso' },
];

const ModulosImpresion: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className='modulos-impresion'>
      <IconButton
        onClick={() => navigate('/dashboard')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 40, color: '#46707e' }} />
      </IconButton>
      <Box sx={{ width: '100%', textAlign: 'center', mb: 4 }}>
        <Typography variant="h5">
          SELECCIONA EL FORMATO DE ETIQUETA QUE REQUIERES IMPRIMIR
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={4} justifyContent="center">
          {modules.map((item, index) => (
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
                  {item.image && <img src={item.image} alt={item.label} style={{ width: '50%', height: 'auto' }} />}
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

export default ModulosImpresion;
