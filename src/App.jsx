/**
 * App.jsx
 *
 * Root application component for Cricket Scouter.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import PlayersListingPage from './pages/PlayersListingPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/players" replace />} />

        <Route
          path="/players"
          element={
            <ErrorBoundary>
              <PlayersListingPage />
            </ErrorBoundary>
          }
        />

        <Route
          path="/players/:id"
          element={
            <ErrorBoundary>
              <PlayerDetailPage />
            </ErrorBoundary>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
