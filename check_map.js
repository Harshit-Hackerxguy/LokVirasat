const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:3000/map');
  
  const hasError = await page.evaluate(() => {
    return new Promise(resolve => {
      // we can't easily hook into map instance here unless it's global
      setTimeout(() => resolve("done"), 5000);
    });
  });
  await browser.close();
})();
