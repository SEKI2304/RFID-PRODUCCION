import React from 'react';
import './footer.scss'; // Asegúrate de importar el archivo SCSS adecuadamente

const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-left">
        <p>© 2024 BIOFLEX. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
