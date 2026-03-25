/**
 * components/layout/Layout.jsx
 *
 * Shell layout component that wraps all pages.
 * Manages the sidebar open/closed state (mobile drawer).
 *
 * Renders:
 *   - Skip link (accessibility)
 *   - Header
 *   - Sidebar (with overlay)
 *   - <main> content area
 */

import React from 'react';
import Header from './Header';
import '../../styles/layout.css';

/**
 * Layout shell component.
 *
 * @param {object}      props
 * @param {React.ReactNode} props.children - Page content rendered in the main area.
 */
const Layout = ({ children }) => {
  return (
    <>
      {/* Accessibility: skip to main content */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Header />

      <div className="app-shell">
        <main id="main-content" className="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
