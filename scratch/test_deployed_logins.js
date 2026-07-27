const https = require("https");

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const u = new URL(url);
    
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
      }
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
    });
    
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const host = "https://assetflow-backend-0ebl.onrender.com/api/auth/login";
  const users = [
    { name: "Admin", email: "admin@assetflow.com" },
    { name: "Asset Manager", email: "manager@assetflow.com" },
    { name: "Dept Head", email: "head@assetflow.com" },
    { name: "Employee", email: "employee@assetflow.com" }
  ];
  
  console.log("Testing logins against deployed host:", host);
  for (const user of users) {
    const result = await postJson(host, {
      email: user.email,
      password: "AssetFlowSecure2026!"
    });
    
    console.log(`${user.name} (${user.email}):`, result.statusCode, result.body);
  }
}

main();
