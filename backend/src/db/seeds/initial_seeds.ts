import { Knex } from "knex";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries in reverse order using standard DELETE queries
  await knex("activity_logs").del();
  await knex("notifications").del();
  await knex("audit_results").del();
  await knex("audit_assignments").del();
  await knex("audit_cycles").del();
  await knex("maintenance_requests").del();
  await knex("resource_bookings").del();
  await knex("transfer_requests").del();
  await knex("asset_allocations").del();
  await knex("assets").del();
  await knex("asset_categories").del();
  await knex("employees").del();
  await knex("departments").del();

  // Reset tag sequence
  await knex.raw("ALTER SEQUENCE seq_asset_tags RESTART WITH 100;");

  // 1. Insert Departments
  const [executiveDept] = await knex("departments")
    .insert({ name: "Executive", status: "Active" })
    .returning("id");

  const [engineeringDept] = await knex("departments")
    .insert({ name: "Engineering", parent_department_id: executiveDept.id, status: "Active" })
    .returning("id");

  const [facilitiesDept] = await knex("departments")
    .insert({ name: "Facilities", parent_department_id: executiveDept.id, status: "Active" })
    .returning("id");

  const [fieldOpsDept] = await knex("departments")
    .insert({ name: "Field Ops", parent_department_id: executiveDept.id, status: "Active" })
    .returning("id");

  const [fieldOpsEastDept] = await knex("departments")
    .insert({ name: "Field Ops East", parent_department_id: fieldOpsDept.id, status: "Inactive" })
    .returning("id");

  // 2. Insert Employees
  const rawPassword = process.env.SEED_USER_PASSWORD || "AssetFlowSecure2026!";
  const empPasswordHash = await bcrypt.hash(rawPassword, 10);

  // Admin Account (admin@assetflow.com / AssetFlowSecure2026!)
  const [adminEmployee] = await knex("employees")
    .insert({
      name: "System Admin",
      email: "admin@assetflow.com",
      password_hash: empPasswordHash,
      department_id: executiveDept.id,
      role: "Admin",
      status: "Active",
    })
    .returning("id");

  await knex("departments").where({ id: executiveDept.id }).update({ department_head_id: adminEmployee.id });

  // Manager Account (manager@assetflow.com / AssetFlowSecure2026!)
  const [managerEmployee] = await knex("employees")
    .insert({
      name: "Jane AssetMgr",
      email: "manager@assetflow.com",
      password_hash: empPasswordHash,
      department_id: facilitiesDept.id,
      role: "AssetManager",
      status: "Active",
    })
    .returning("id");

  // Department Head Account (head@assetflow.com / AssetFlowSecure2026!)
  const [headEmployee] = await knex("employees")
    .insert({
      name: "Aditi Rao (Dept Head)",
      email: "head@assetflow.com",
      password_hash: empPasswordHash,
      department_id: engineeringDept.id,
      role: "DepartmentHead",
      status: "Active",
    })
    .returning("id");

  await knex("departments").where({ id: engineeringDept.id }).update({ department_head_id: headEmployee.id });

  // Employee Account (employee@assetflow.com / AssetFlowSecure2026!)
  const [employeeUser] = await knex("employees")
    .insert({
      name: "Priya Shah (Staff)",
      email: "employee@assetflow.com",
      password_hash: empPasswordHash,
      department_id: engineeringDept.id,
      role: "Employee",
      status: "Active",
    })
    .returning("id");

  // Aditi Rao (Engineering Head alias)
  const [aditiEmployee] = await knex("employees")
    .insert({
      name: "aditi rao",
      email: "aditi@assetflow.com",
      password_hash: empPasswordHash,
      department_id: engineeringDept.id,
      role: "DepartmentHead",
      status: "Active",
    })
    .returning("id");

  // Rohan Mehta (Facilities Head)
  const [rohanEmployee] = await knex("employees")
    .insert({
      name: "rohan mehta",
      email: "rohan@assetflow.com",
      password_hash: empPasswordHash,
      department_id: facilitiesDept.id,
      role: "DepartmentHead",
      status: "Active",
    })
    .returning("id");

  await knex("departments").where({ id: facilitiesDept.id }).update({ department_head_id: rohanEmployee.id });

  // Sana Iqbal (Field ops Head)
  const [sanaEmployee] = await knex("employees")
    .insert({
      name: "sana iqbal",
      email: "sana@assetflow.com",
      password_hash: empPasswordHash,
      department_id: fieldOpsEastDept.id,
      role: "Employee",
      status: "Active",
    })
    .returning("id");

  await knex("departments").where({ id: fieldOpsEastDept.id }).update({ department_head_id: sanaEmployee.id });

  // Priya Shah (Engineering Staff)
  const [priyaEmployee] = await knex("employees")
    .insert({
      name: "Priya shah",
      email: "priya@assetflow.com",
      password_hash: empPasswordHash,
      department_id: engineeringDept.id,
      role: "Employee",
      status: "Active",
    })
    .returning("id");

  // Arjun Nair (Engineering Staff)
  const [arjunEmployee] = await knex("employees")
    .insert({
      name: "Arjun Nair",
      email: "arjun@assetflow.com",
      password_hash: empPasswordHash,
      department_id: engineeringDept.id,
      role: "Employee",
      status: "Active",
    })
    .returning("id");

  // Auditors: A Rao, S Iqbal
  const [aRaoEmployee] = await knex("employees")
    .insert({
      name: "A Rao",
      email: "arao@assetflow.com",
      password_hash: empPasswordHash,
      department_id: engineeringDept.id,
      role: "Employee",
      status: "Active",
    })
    .returning("id");

  const [sIqbalEmployee] = await knex("employees")
    .insert({
      name: "S Iqbal",
      email: "siqbal@assetflow.com",
      password_hash: empPasswordHash,
      department_id: engineeringDept.id,
      role: "Employee",
      status: "Active",
    })
    .returning("id");

  // 3. Insert Asset Categories
  const [electronicsCat] = await knex("asset_categories")
    .insert({
      name: "Electronics",
      custom_fields: JSON.stringify({ warranty_months: 24, manufacturer: "Dell, Apple" }),
    })
    .returning("id");

  const [furnitureCat] = await knex("asset_categories")
    .insert({
      name: "Furniture",
      custom_fields: JSON.stringify({ material: "Wood, Metal" }),
    })
    .returning("id");

  const [vehiclesCat] = await knex("asset_categories")
    .insert({
      name: "Vehicles",
      custom_fields: JSON.stringify({ fuel_type: "Electric" }),
    })
    .returning("id");

  // 4. Insert Assets
  const [laptop12] = await knex("assets")
    .insert({
      name: "Dell Laptop",
      category_id: electronicsCat.id,
      asset_tag: "AF-0012",
      serial_number: "SN-DELL-1200",
      acquisition_date: "2024-03-12",
      acquisition_cost: 1200.0,
      condition: "Good",
      location: "bengaluru",
      status: "Allocated",
      is_bookable: true,
    })
    .returning("id");

  const [macbook13] = await knex("assets")
    .insert({
      name: "MacBook Pro 16",
      category_id: electronicsCat.id,
      asset_tag: "AF-0013",
      serial_number: "SN-APPL-1600",
      acquisition_date: "2024-01-15",
      acquisition_cost: 2400.0,
      condition: "New",
      location: "bengaluru",
      status: "Available",
      is_bookable: true,
    })
    .returning("id");

  const [desk14] = await knex("assets")
    .insert({
      name: "Ergonomic Standing Desk",
      category_id: furnitureCat.id,
      asset_tag: "AF-0014",
      serial_number: "SN-DESK-882",
      acquisition_date: "2023-11-20",
      acquisition_cost: 650.0,
      condition: "Good",
      location: "mumbai",
      status: "Available",
      is_bookable: false,
    })
    .returning("id");

  const [van15] = await knex("assets")
    .insert({
      name: "Delivery Van EV",
      category_id: vehiclesCat.id,
      asset_tag: "AF-0015",
      serial_number: "SN-VAN-EV99",
      acquisition_date: "2025-02-01",
      acquisition_cost: 35000.0,
      condition: "Good",
      location: "delhi",
      status: "Allocated",
      is_bookable: true,
    })
    .returning("id");

  // 5. Initial Allocations
  await knex("asset_allocations").insert({
    asset_id: laptop12.id,
    employee_id: priyaEmployee.id,
    allocated_date: "2024-03-15",
    expected_return_date: "2026-12-31",
    status: "Active",
  });

  await knex("asset_allocations").insert({
    asset_id: van15.id,
    employee_id: sanaEmployee.id,
    allocated_date: "2025-02-05",
    expected_return_date: "2026-12-31",
    status: "Active",
  });

  // 6. Initial Resource Bookings
  await knex("resource_bookings").insert({
    asset_id: macbook13.id,
    booked_by_employee_id: employeeUser.id,
    start_time: "2026-07-26T10:00:00.000Z",
    end_time: "2026-07-26T14:00:00.000Z",
    status: "Upcoming",
  });

  // 7. Initial Maintenance Requests
  await knex("maintenance_requests").insert({
    asset_id: laptop12.id,
    raised_by_employee_id: priyaEmployee.id,
    issue_description: "Battery drain issue & heating under load",
    priority: "Medium",
    status: "Pending",
  });

  // 8. Initial Audit Cycles
  const [cycle1] = await knex("audit_cycles")
    .insert({
      scope_department_id: engineeringDept.id,
      scope_location: "bengaluru",
      start_date: "2026-07-01",
      end_date: "2026-07-31",
      status: "Open",
    })
    .returning("id");

  await knex("audit_assignments").insert([
    { audit_cycle_id: cycle1.id, auditor_employee_id: headEmployee.id },
    { audit_cycle_id: cycle1.id, auditor_employee_id: aRaoEmployee.id },
  ]);

  // 9. Initial Notifications
  await knex("notifications").insert([
    {
      employee_id: adminEmployee.id,
      type: "Audit",
      message: "Physical audit cycle #1 for Engineering department (bengaluru) has been scheduled.",
      is_read: false,
    },
    {
      employee_id: headEmployee.id,
      type: "Booking",
      message: "Priya Shah requested booking for MacBook Pro 16.",
      is_read: false,
    },
    {
      employee_id: employeeUser.id,
      type: "Allocation",
      message: "Dell Laptop (AF-0012) has been assigned to your profile.",
      is_read: true,
    },
  ]);

  // 10. Initial Activity Logs
  await knex("activity_logs").insert([
    {
      employee_id: adminEmployee.id,
      action: "REGISTER_ASSET",
      entity_type: "asset",
      entity_id: laptop12.id,
    },
    {
      employee_id: adminEmployee.id,
      action: "CREATE_AUDIT_CYCLE",
      entity_type: "audit_cycle",
      entity_id: cycle1.id,
    },
  ]);
}
