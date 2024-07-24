import * as React from 'react';
import { Box, Grid, Typography, useTheme, useMediaQuery } from '@mui/material';
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
  { icon: PrintIcon, label: 'IMPRESION TARIMA PRODUCCION', path: '/ModulosTarima' },
  { icon: WebIcon, label: 'CONSULTAS', path: '/consultas' },
];

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isXSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const iconSize = isXSmall ? 40 : 60; // Smaller icons on very small devices

  return (
    <Box sx={{ flexGrow: 1, p: 4 }}>
      <Grid container spacing={4}>
        {icons.map((item, index) => {
          const Icon = item.icon; // Ensure the icon component is capitalized
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Link to={item.path} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 150, // Usar minHeight en lugar de una altura fija
                  backgroundColor: '#46707e',
                  borderRadius: 2,
                  boxShadow: 3,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#3b5c6b',
                  },
                  padding: theme.spacing(2), // Aplica padding uniformemente alrededor del contenido
                  paddingTop: theme.spacing(2), // Añade padding en la parte superior específicamente
                  paddingBottom: theme.spacing(2) // Añade padding en la parte inferior específicamente
                }}
                >
                <Icon sx={{ fontSize: iconSize }} />
                <Typography variant="h6" sx={{ mt: 2, fontSize: isXSmall ? '0.875rem' : '1rem' }}>
                  {item.label}
                </Typography>
              </Box>
              </Link>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};
