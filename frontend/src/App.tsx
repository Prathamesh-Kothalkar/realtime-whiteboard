import React, { useEffect, useState, useRef } from 'react';
import keycloak from './utils/keycloak';
import Whiteboard from './components/Whiteboard';
import AuthButtons from './components/AuthButton';
import Navbar from './components/Navbar';

const App = () => {
  const [authenticated, setAuthenticated] = useState<Boolean>(false);
  const [loading, setLoading] = useState<Boolean>(true);
  const [sessionId, setSessionId] = useState<string>("");
  const [inputSessionId, setInputSessionId] = useState<string>("");
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

  const handleCreateSession = () => {
    // Generate a simple random session ID (could be improved)
    const newSessionId = Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSessionId.trim()) {
      setSessionId(inputSessionId.trim());
    }
  };

  if (loading) return <div>Loading...</div>;

 return (
  <div>
    <Navbar sessionId={sessionId} /> 

    <div className="container mt-4">
      <h3 className="mb-3">Real-time Whiteboard</h3>

      {authenticated && !sessionId && (
        <div className="session-controls">
          <button className="btn btn-primary me-2" onClick={handleCreateSession}>
            Create New Session
          </button>
          <form onSubmit={handleJoinSession} style={{ display: 'inline-block' }}>
            <input
              type="text"
              placeholder="Enter Session ID"
              value={inputSessionId}
              onChange={e => setInputSessionId(e.target.value)}
              className="form-control d-inline-block"
              style={{ width: 180, marginRight: 8 }}
            />
            <button className="btn btn-success" type="submit">
              Join Session
            </button>
          </form>
        </div>
      )}

      {authenticated && sessionId && <Whiteboard sessionId={sessionId} />}
      {!authenticated && <div>Please log in to access the whiteboard.</div>}
    </div>
  </div>
);

};

export default App;