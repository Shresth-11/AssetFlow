const https = require("https");

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on("error", reject);
  });
}

async function main() {
  const target = "https://assetflow-backend-0ebl.onrender.com/api/auth/init-db";
  console.log("Triggering DB migration & seeding on deployed backend:", target);
  console.log("Please wait, this might take up to 60s for Render/PostgreSQL spin-up...");
  
  try {
    const start = Date.now();
    const result = await getUrl(target);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    
    console.log(`Finished in ${duration}s.`);
    console.log("Status Code:", result.statusCode);
    console.log("Response Body:");
    try {
      console.log(JSON.stringify(JSON.parse(result.body), null, 2));
    } catch (e) {
      console.log(result.body);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
