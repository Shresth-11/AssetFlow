const https = require("https");

function getJson(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {
      "Authorization": `Bearer ${token}`
    };
    
    https.get({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname,
      method: "GET",
      headers
    }, (res) => {
      let buf = "";
      res.on("data", chunk => buf += chunk);
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(buf)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: buf
          });
        }
      });
    }).on("error", reject);
  });
}

async function main() {
  const adminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTY4LCJpYXQiOjE3ODUxNTcwOTcsImV4cCI6MTc4NTc2MTg5N30.We_-Z8_OS4JSlOQsO5d9m_LNTeoQSFDx4jJGBLO24pg";
  const url = "https://assetflow-backend-0ebl.onrender.com/api/org/employees";
  
  console.log("Querying employee directory on deployed server...");
  const res = await getJson(url, adminToken);
  console.log("Status:", res.statusCode);
  if (res.body && res.body.employees) {
    console.log("Employees found:");
    res.body.employees.forEach(emp => {
      console.log(`- ID: ${emp.id}, Name: "${emp.name}", Email: "${emp.email}", Role: "${emp.role}", Status: "${emp.status}"`);
    });
  } else {
    console.log("Response:", res.body);
  }
}

main();
