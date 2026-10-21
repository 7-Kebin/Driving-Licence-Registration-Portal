const db = require('../config/db');

async function generateApplicationNumber() {
  const year = new Date().getFullYear();
  let unique = false;
  let appNumber = '';

  while (!unique) {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    appNumber = `DL-${year}-${randomDigits}`;

    const [existing] = await db.query(
      'SELECT id FROM applications WHERE application_number = ?',
      [appNumber]
    );

    if (existing.length === 0) {
      unique = true;
    }
  }

  return appNumber;
}

module.exports = { generateApplicationNumber };
