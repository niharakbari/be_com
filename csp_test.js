const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const violations = [];
  
  // Listen for securitypolicyviolation events on the page
  await page.evaluateOnNewDocument(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      window._cspViolations = window._cspViolations || [];
      window._cspViolations.push({
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
        blockedURI: e.blockedURI,
        sourceFile: e.sourceFile,
        lineNumber: e.lineNumber,
        documentURI: e.documentURI
      });
    });
  });

  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('Content Security Policy')) {
      console.log('Browser CSP Error Log:', msg.text());
    }
  });

  console.log("Navigating to http://localhost:5174...");
  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (err) {
    console.log("Navigation issue:", err.message);
  }

  // Retrieve caught violations
  const v = await page.evaluate(() => window._cspViolations || []);
  console.log("=== CSP VIOLATIONS OBSERVED ===");
  if (v.length === 0) {
    console.log("No violations!");
  } else {
    console.log(JSON.stringify(v, null, 2));
  }
  
  await browser.close();
  process.exit(0);
})();
