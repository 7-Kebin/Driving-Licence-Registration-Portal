const db = require('../config/db');

async function generateLicenseNumber(testCenter = 'RTO Central') {
  // Extract state code or default to DL
  let prefix = 'DL-DL01';
  if (testCenter.includes('KA-')) prefix = 'DL-KA01';
  else if (testCenter.includes('GJ-')) prefix = 'DL-GJ01';
  else if (testCenter.includes('WB-')) prefix = 'DL-WB02';
  else if (testCenter.includes('MH-')) prefix = 'DL-MH01';
  else if (testCenter.includes('TN-')) prefix = 'DL-TN01';

  const year = new Date().getFullYear();
  const randomSerial = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}-${year}${randomSerial}`;
}

module.exports = { generateLicenseNumber };
