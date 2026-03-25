/**
 * components/layout/Header.jsx
 *
 * Fixed top header bar for Cricket Scouter.
 *
 * Shows the app logo/brand name, a spacer, and a hamburger button on mobile
 * that toggles the sidebar drawer.
 *
 * @param {{ onMenuToggle: () => void }} props
 */

import React from 'react';

/**
 * Header component.
 *
 * @param {object}   props
 * @param {Function} props.onMenuToggle - Called when the mobile menu button is clicked.
 */
const Header = () => {
  return (
    <header className="header" role="banner">
      <div className="header__logo font-tungsten" aria-label="Cricket Scouter home">
        CRICKET<span>SCOUTER</span>
      </div>

      <div className="header__spacer" aria-hidden="true" />
    </header>
  );
};

export default Header;
