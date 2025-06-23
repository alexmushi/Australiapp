import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@material/web/all.js';
import {styles as typography} from '@material/web/typography/md-typescale-styles.js';
import App from './App.jsx';

document.adoptedStyleSheets.push(typography.styleSheet);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
