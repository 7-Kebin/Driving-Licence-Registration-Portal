require('dotenv').config();
const { initDatabase, getDbType } = require('../config/db');

async function runSeed() {
  console.log('[Seed Runner] Triggering database seeding process...');
  await initDatabase();
  console.log(`[Seed Runner] Complete using engine: ${getDbType()}`);
  process.exit(0);
}

runSeed().catch(err => {
  console.error('[Seed Runner Error]', err);
  process.exit(1);
});
