require('dotenv').config();
const app = require('./app');
const { initDatabase, getDbType } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('------------------------------------------------------------');
    console.log('   Driving License Registration Portal - Backend Service    ');
    console.log('------------------------------------------------------------');

    // Initialize Database (MySQL or Relational Fallback)
    await initDatabase();

    app.listen(PORT, () => {
      console.log(`[Server] API server running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Active RDBMS Engine: ${getDbType().toUpperCase()}`);
      console.log('------------------------------------------------------------');
    });
  } catch (err) {
    console.error('[Server Startup Failure]', err);
    process.exit(1);
  }
}

startServer();
