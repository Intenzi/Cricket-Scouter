/**
 * main.jsx
 *
 * Application entry point for Cricket Scouter.
 *
 * Renders the React tree into the #root element.
 * BrowserRouter provides URL routing throughout the app.
 * SyncGate manages the boot sequence before showing App.
 *
 * Only base.css is imported here — it chains in reset.css and tokens.css.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import SyncGate from './components/sync/SyncGate';
import './styles/base.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SyncGate />
    </BrowserRouter>
  </React.StrictMode>
);
