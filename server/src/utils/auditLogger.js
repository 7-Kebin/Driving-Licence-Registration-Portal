const db = require('../config/db');

async function logAudit({ userId = null, action, entityType, entityId = null, details = {}, ipAddress = '127.0.0.1' }) {
  try {
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
    const sql = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    await db.query(sql, [userId, action, entityType, entityId, detailsStr, ipAddress]);
  } catch (err) {
    console.error('[AuditLog Error]', err.message);
  }
}

module.exports = { logAudit };
