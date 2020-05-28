const puppeteer = require('puppeteer');

const wait = t => new Promise((r) => {
  setTimeout(r,t);
});

const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const GOOGLE_LOGIN = process.env.GOOGLE_LOGIN;

if (!GOOGLE_PASSWORD || !GOOGLE_LOGIN) {
  console.error('No login data!');
  throw new Error('No login data!');
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1366, height: 768})
  await page.goto('https://badoo.com');

  const href = await page.evaluate(() => document.querySelector('a[href*="https://badoo.com/google/"]').href);
 
  await page.goto(href);

  await page.$eval('input[type="email"]', (el, email) => el.value = email, GOOGLE_LOGIN);
  await wait(500);
  
  await page.$eval('#identifierNext div:nth-child(2)', el => el.click());
  
  await wait(1000);
  
  await page.$eval('input[type="password"]', (el, pass) => el.value = pass, GOOGLE_PASSWORD);
  await wait(500);
  await page.$eval('#passwordNext div:nth-child(2)', el => el.click());
  await wait(5000);

  await page.goto('https://badoo.com');

  await wait(5000);
  await browser.close();
  console.log('done');
})();