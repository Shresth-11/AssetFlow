const https = require("https");

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    }).on("error", reject);
  });
}

async function main() {
  try {
    console.log("Fetching index.html from Vercel...");
    const html = await getUrl("https://odoo-peach.vercel.app/");
    
    // Find script tags
    // e.g., <script type="module" crossorigin src="/assets/index-CvNMSMN4.js"></script>
    const match = html.match(/src="([^"]+)"/);
    if (!match) {
      console.log("No script tag src found in HTML.");
      console.log(html);
      return;
    }
    
    const scriptUrl = "https://odoo-peach.vercel.app" + match[1];
    console.log("Fetching script bundle:", scriptUrl);
    const js = await getUrl(scriptUrl);
    
    // Look for VITE_API_URL or backend host patterns
    const urls = js.match(/https?:\/\/[a-zA-Z0-9.-]+\.(?:onrender\.com|railway\.app|herokuapp\.com|vercel\.app|aws|gcp)[a-zA-Z0-9.\/_-]*/g);
    console.log("Found URLs in JS script bundle:");
    console.log(urls ? [...new Set(urls)] : "None found");

    // Also search for general https://
    const allHttps = js.match(/https?:\/\/[a-zA-Z0-9.-]+/g);
    if (allHttps) {
      console.log("All unique HTTP/HTTPS domains found:");
      console.log([...new Set(allHttps)]);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
