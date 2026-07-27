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
          body: data
        });
      });
    }).on("error", reject);
  });
}

async function main() {
  const target = "https://assetflow-backend-0ebl.onrender.com/api/auth/debug-seed-file";
  console.log("Checking deployed seed file from:", target);
  console.log("Waiting up to 45s for Render deployment / spin-up...");
  
  try {
    const start = Date.now();
    const result = await getUrl(target);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    
    console.log(`Finished in ${duration}s.`);
    console.log("Status Code:", result.statusCode);
    console.log("Response Body (Truncated first 1200 chars):");
    console.log(result.body.substring(0, 1500));
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
