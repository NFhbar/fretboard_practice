import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme/global.css';
import { applyStagedImport, migrate } from './state/storage.js';
import App from './App.jsx';

applyStagedImport();
migrate();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
