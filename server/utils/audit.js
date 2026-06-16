import AuditLog from '../models/AuditLog.js';

export const writeAuditLog = async ({ req, action, entity, entityId, metadata = {} }) => {
  try {
    await AuditLog.create({
      actor: req.user?._id,
      action,
      entity,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error(`Audit log failed: ${error.message}`);
  }
};
