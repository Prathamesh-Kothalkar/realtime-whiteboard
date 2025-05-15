import './App.css'
import keycloak from './auth/keycloak';
import Whiteboard from './components/Whiteboard';

keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
  if (authenticated) {
    alert('✅ Authenticated');
  } else {
    window.location.reload();
  }
});


function App() {
  
  return (
    <>
      
      <Whiteboard/>
    </>
  )
}

export default App
