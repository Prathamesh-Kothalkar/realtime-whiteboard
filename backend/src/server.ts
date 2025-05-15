import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { keycloak, memoryStore, session } from './config/keycloack';
import { initializeSocket } from './socket';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = initializeSocket(server);

app.use(
  session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

app.use(keycloak.middleware());

app.get('/protected', keycloak.protect(), (req, res) => {
  res.send('Access granted');
});

app.get('/logout', (req, res) => {
  const redirectUrl = 'http://localhost:3000';
  res.redirect(`http://localhost:8080/realms/your-realm-name/protocol/openid-connect/logout?redirect_uri=${redirectUrl}`);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
