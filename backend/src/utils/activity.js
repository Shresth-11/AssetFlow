const db = require("../config/db");

async function logActivity(employeeId, action, entityType, entityId) {
  try {
    await db("activity_logs").insert({
      employee_id: employeeId,
      action,
      entity_type: entityType,
      entity_id: entityId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

async function createNotification(employeeId, type, message) {
  try {
    await db("notifications").insert({
      employee_id: employeeId,
      type,
      message,
      is_read: false,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

module.exports = {
  logActivity,
  createNotification,
};
