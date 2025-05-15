import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'your-realm-name',
  clientId: 'your-client-id',
});

export default keycloak;
