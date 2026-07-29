exports.up = async function (knex) {
  await knex.raw(`
    -- Create indexes on actual existing foreign key columns to speed up joins and query planning
    CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);
    CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(department_head_id);
    
    CREATE INDEX IF NOT EXISTS idx_resource_bookings_booked_by ON resource_bookings(booked_by_employee_id);
    
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_asset ON transfer_requests(asset_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_from ON transfer_requests(from_employee_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_to ON transfer_requests(to_employee_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_approved ON transfer_requests(approved_by);
    
    CREATE INDEX IF NOT EXISTS idx_maintenance_requests_asset ON maintenance_requests(asset_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_requests_raised ON maintenance_requests(raised_by_employee_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_requests_approved ON maintenance_requests(approved_by);
    
    CREATE INDEX IF NOT EXISTS idx_audit_cycles_dept ON audit_cycles(scope_department_id);
    
    CREATE INDEX IF NOT EXISTS idx_audit_assignments_cycle ON audit_assignments(audit_cycle_id);
    CREATE INDEX IF NOT EXISTS idx_audit_assignments_auditor ON audit_assignments(auditor_employee_id);
    
    CREATE INDEX IF NOT EXISTS idx_audit_results_cycle ON audit_results(audit_cycle_id);
    CREATE INDEX IF NOT EXISTS idx_audit_results_asset ON audit_results(asset_id);
    
    CREATE INDEX IF NOT EXISTS idx_notifications_employee ON notifications(employee_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_employee ON activity_logs(employee_id);
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_departments_parent;
    DROP INDEX IF EXISTS idx_departments_head;
    
    DROP INDEX IF EXISTS idx_resource_bookings_booked_by;
    
    DROP INDEX IF EXISTS idx_transfer_requests_asset;
    DROP INDEX IF EXISTS idx_transfer_requests_from;
    DROP INDEX IF EXISTS idx_transfer_requests_to;
    DROP INDEX IF EXISTS idx_transfer_requests_approved;
    
    DROP INDEX IF EXISTS idx_maintenance_requests_asset;
    DROP INDEX IF EXISTS idx_maintenance_requests_raised;
    DROP INDEX IF EXISTS idx_maintenance_requests_approved;
    
    DROP INDEX IF EXISTS idx_audit_cycles_dept;
    
    DROP INDEX IF EXISTS idx_audit_assignments_cycle;
    DROP INDEX IF EXISTS idx_audit_assignments_auditor;
    
    DROP INDEX IF EXISTS idx_audit_results_cycle;
    DROP INDEX IF EXISTS idx_audit_results_asset;
    
    DROP INDEX IF EXISTS idx_notifications_employee;
    DROP INDEX IF EXISTS idx_activity_logs_employee;
  `);
};
