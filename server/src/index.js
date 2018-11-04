require('dotenv').config({ path: '.env' });

const createServer = require('./createServer.js');
const server = createServer();


server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.CLIENT_URL,
    },
  },
  details => {
    console.log(`Server is now running on port http://localhost:${details.port}`);
  }
);
