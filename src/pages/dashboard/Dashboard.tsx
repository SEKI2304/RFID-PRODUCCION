import * as React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WebIcon from '@mui/icons-material/Web';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SatelliteIcon from '@mui/icons-material/Satellite';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PrintIcon from '@mui/icons-material/Print';

const icons = [
  { icon: <ArrowUpwardIcon sx={{ fontSize: 60 }} />, label: 'ENTRADAS', path: '/entradas' },
  { icon: <ExitToAppIcon sx={{ fontSize: 60 }} />, label: 'SALIDAS', path: '/salidas' },
  { icon: <LocationOnIcon sx={{ fontSize: 60 }} />, label: 'UBICACIÓN', path: '/ubicacion' },
  { icon: <WebIcon sx={{ fontSize: 60 }} />, label: 'CONSULTAS', path: '/consultas' },
  { icon: <SignalWifi4BarIcon sx={{ fontSize: 60 }} />, label: 'HANDHELD', path: '/handheld' },
  { icon: <SatelliteIcon sx={{ fontSize: 60 }} />, label: 'ANTENAS', path: '/antenas' },
  { icon: <LibraryBooksIcon sx={{ fontSize: 60 }} />, label: 'CATALOGOS', path: '/catalogos' },
  { icon: <PrintIcon sx={{ fontSize: 60 }} />, label: 'IMPRESION', path: '/modulosimpresion' },
];

export const Dashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 4 }}>
      <Grid container spacing={4}>
        {icons.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link to={item.path} style={{ textDecoration: 'none' }}>
              <Box
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
  );
};
