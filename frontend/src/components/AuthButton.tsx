import keycloak from '../utils/keycloak'; 

const AuthButtons = () => {
  const handleLogin = () => {
    keycloak.login();
  };

  const handleLogout = () => {
    keycloak.logout();
  };

  const handleRegister = () => {
  keycloak.register();
};

  return (
    <div>
      {!keycloak.authenticated && (
        <button onClick={handleLogin} className="btn btn-primary me-2">
          Login
        </button>
      )}
      {keycloak.authenticated && (
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      )}

        {keycloak.authenticated && (
            <button onClick={handleRegister} className="btn btn-secondary me-2">
            Register
            </button>
        )}
    </div>
  );
};

export default AuthButtons;