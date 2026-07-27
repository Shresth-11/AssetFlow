const knex = require("knex");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../backend/.env") });

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "assetflow",
  }
});

async function main() {
  try {
    console.log("Checking local employees table...");
    const emps = await db("employees").select("*").orderBy("id", "asc");
    console.log(`Found ${emps.length} employees:`);
    emps.forEach(emp => {
      console.log(`- ID: ${emp.id}, Name: "${emp.name}", Email: "${emp.email}", Role: "${emp.role}"`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await db.destroy();
  }
}

main();
