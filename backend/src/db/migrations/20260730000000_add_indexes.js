exports.up = async function (knex) {
  await knex.raw(`
    -- Create indexes on frequently joined foreign key columns
    CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
    
    CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);
    CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(department_head_id);
    
    CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
    CREATE INDEX IF NOT EXISTS idx_assets_department ON assets(department_id);
    CREATE INDEX IF NOT EXISTS idx_assets_holder ON assets(current_holder_id);
    
    CREATE INDEX IF NOT EXISTS idx_asset_allocations_asset ON asset_allocations(asset_id);
    CREATE INDEX IF NOT EXISTS idx_asset_allocations_employee ON asset_allocations(employee_id);
    CREATE INDEX IF NOT EXISTS idx_asset_allocations_by ON asset_allocations(allocated_by);
    
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_asset ON transfer_requests(asset_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_source ON transfer_requests(source_employee_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_target ON transfer_requests(target_employee_id);
    CREATE INDEX IF NOT EXISTS idx_transfer_requests_approved ON transfer_requests(approved_by);
    
    CREATE INDEX IF NOT EXISTS idx_resource_bookings_asset ON resource_bookings(asset_id);
    CREATE INDEX IF NOT EXISTS idx_resource_bookings_employee ON resource_bookings(employee_id);
    CREATE INDEX IF NOT EXISTS idx_resource_bookings_approved ON resource_bookings(approved_by);
    
    CREATE INDEX IF NOT EXISTS idx_maintenance_requests_asset ON maintenance_requests(asset_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_requests_raised ON maintenance_requests(raised_by_employee_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_requests_approved ON maintenance_requests(approved_by);
    
    CREATE INDEX IF NOT EXISTS idx_audit_cycles_dept ON audit_cycles(scope_department_id);
    CREATE INDEX IF NOT EXISTS idx_audit_cycles_created ON audit_cycles(created_by);
    
    CREATE INDEX IF NOT EXISTS idx_audit_assignments_cycle ON audit_assignments(audit_cycle_id);
    CREATE INDEX IF NOT EXISTS idx_audit_assignments_auditor ON audit_assignments(auditor_employee_id);
    
    CREATE INDEX IF NOT EXISTS idx_audit_results_cycle ON audit_results(audit_cycle_id);
    CREATE INDEX IF NOT EXISTS idx_audit_results_asset ON audit_results(asset_id);
    CREATE INDEX IF NOT EXISTS idx_audit_results_by ON audit_results(audited_by);
    
    CREATE INDEX IF NOT EXISTS idx_notifications_employee ON notifications(employee_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_employee ON activity_logs(employee_id);
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    -- Drop indexes if rolled back
    DROP INDEX IF EXISTS idx_employees_department;
    
    DROP INDEX IF EXISTS idx_departments_parent;
    DROP INDEX IF EXISTS idx_departments_head;
    
    DROP INDEX IF EXISTS idx_assets_category;
    DROP INDEX IF EXISTS idx_assets_department;
    DROP INDEX IF EXISTS idx_assets_holder;
    
    DROP INDEX IF EXISTS idx_asset_allocations_asset;
    DROP INDEX IF EXISTS idx_asset_allocations_employee;
    DROP INDEX IF EXISTS idx_asset_allocations_by;
    
    DROP INDEX IF EXISTS idx_transfer_requests_asset;
    DROP INDEX IF EXISTS idx_transfer_requests_source;
    DROP INDEX IF EXISTS idx_transfer_requests_target;
    DROP INDEX IF EXISTS idx_transfer_requests_approved;
    
    DROP INDEX IF EXISTS idx_resource_bookings_asset;
    DROP INDEX IF EXISTS idx_resource_bookings_employee;
    DROP INDEX IF EXISTS idx_resource_bookings_approved;
    
    DROP INDEX IF EXISTS idx_maintenance_requests_asset;
    DROP INDEX IF EXISTS idx_maintenance_requests_raised;
    DROP INDEX IF EXISTS idx_maintenance_requests_approved;
    
    DROP INDEX IF EXISTS idx_audit_cycles_dept;
    DROP INDEX IF EXISTS idx_audit_cycles_created;
    
    DROP INDEX IF EXISTS idx_audit_assignments_cycle;
    DROP INDEX IF EXISTS idx_audit_assignments_auditor;
    
    DROP INDEX IF EXISTS idx_audit_results_cycle;
    DROP INDEX IF EXISTS idx_audit_results_asset;
    DROP INDEX IF EXISTS idx_audit_results_by;
    
    DROP INDEX IF EXISTS idx_notifications_employee;
    DROP INDEX IF EXISTS idx_activity_logs_employee;
  `);
};
