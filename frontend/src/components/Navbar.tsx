// src/components/Navbar.tsx
import React from 'react';
import keycloak from '../utils/keycloak';

interface NavbarProps {
  sessionId?: string;
}

const Navbar: React.FC<NavbarProps> = ({ sessionId }) => {
  const handleLogout = () => {
    keycloak.logout();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <span className="navbar-brand">🧑‍🎨 Whiteboard App</span>

      <div className="ms-auto d-flex align-items-center">
        {sessionId && (
          <span className="text-white me-3">
            <strong>Session:</strong> {sessionId}
          </span>
        )}
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
