const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const path = require("path");
const db = require("../config/db");
const { authenticateJWT } = require("../middleware/auth");
const { logActivity, createNotification } = require("../utils/activity");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkeyforassetflowerp2026";

router.get("/init-db", async (req, res) => {
  try {
    const hasTable = await db.schema.hasTable("knex_migrations");
    if (hasTable) {
      await db.raw("UPDATE knex_migrations SET name = REPLACE(name, '.ts', '.js');");
    }

    console.log("[Diagnostic API] Running migrations...");
    await db.migrate.latest({
      directory: path.join(__dirname, "../db/migrations"),
    });
    console.log("[Diagnostic API] Running seeds...");
    await db.seed.run({
      directory: path.join(__dirname, "../db/seeds"),
    });
    return res.json({
      status: "Success",
      message: "Database migrated and seeded successfully with demo data",
    });
  } catch (error) {
    console.error("[Diagnostic API] Migration/Seed error:", error);
    return res.status(500).json({
      status: "Error",
      message: "Failed to initialize database",
      error: error.message,
      stack: error.stack,
    });
  }
});

// Zod schemas for input validation
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  department_id: z.number().optional().nullable(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);

    const existing = await db("employees").where({ email: data.email }).first();
    if (existing) {
      return res.status(400).json({ error: "An employee with this email already exists" });
    }

    if (data.department_id) {
      const dept = await db("departments").where({ id: data.department_id }).first();
      if (!dept) {
        return res.status(400).json({ error: "Specified department does not exist" });
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [newEmployee] = await db("employees")
      .insert({
        name: data.name,
        email: data.email.toLowerCase(),
        password_hash: hashedPassword,
        department_id: data.department_id || null,
        role: "Employee",
        status: "Active",
      })
      .returning(["id", "name", "email", "role", "status", "department_id"]);

    const token = jwt.sign({ id: newEmployee.id }, JWT_SECRET, { expiresIn: "7d" });

    await logActivity(newEmployee.id, "Registered an account", "Employee", newEmployee.id);
    await createNotification(
      newEmployee.id,
      "System",
      `Welcome to AssetFlow, ${newEmployee.name}! Your account has been registered successfully.`
    );

    return res.status(210).json({
      message: "Employee registered successfully",
      token,
      user: newEmployee,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Internal server error during registration" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const employee = await db("employees")
      .where({ email: data.email.toLowerCase() })
      .first();

    if (!employee) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (employee.status !== "Active") {
      return res.status(403).json({ error: `Your account is ${employee.status.toLowerCase()}` });
    }

    const passwordMatch = await bcrypt.compare(data.password, employee.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: employee.id }, JWT_SECRET, { expiresIn: "7d" });

    await logActivity(employee.id, "Logged in", "Employee", employee.id);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
        department_id: employee.department_id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error during login" });
  }
});

// Profile Retrieval Route
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const employee = await db("employees")
      .select("employees.id", "employees.name", "employees.email", "employees.role", "employees.status", "employees.department_id", "departments.name as department_name")
      .leftJoin("departments", "employees.department_id", "departments.id")
      .where("employees.id", req.user.id)
      .first();

    return res.json({ user: employee });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ error: "Internal server error fetching profile" });
  }
});

module.exports = router;
