import React, { useEffect, useState, useRef } from 'react';
import keycloak from './utils/keycloak';
import Whiteboard from './components/Whiteboard';
import AuthButtons from './components/AuthButton';

const App = () => {
  const [authenticated, setAuthenticated] = useState<Boolean>(false);
  const [loading, setLoading] = useState<Boolean>(true);
  const initializedRef = useRef<Boolean>(false); 

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true; 

      const isAlreadyAuthenticated:Boolean = keycloak.authenticated || false;
      console.log('Initial Keycloak authenticated state:', isAlreadyAuthenticated);

      if (!isAlreadyAuthenticated) {
        keycloak
          .init({ onLoad: 'login-required' })
          .then((auth) => {
            console.log('Keycloak initialized successfully:', auth);
            setAuthenticated(auth);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Keycloak init error:', error);
            setLoading(false);
            // Consider setting an error state to display a message to the user
          });
      } else {
        setAuthenticated(true);
        setLoading(false);
      }
    }
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <h1 className="mt-3">Real-time Whiteboard</h1>
      <AuthButtons />
      {authenticated && <Whiteboard />} 
      {!authenticated && <div>Please log in to access the whiteboard.</div>}
    </div>
  );
};

export default App;