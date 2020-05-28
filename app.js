const puppeteer = require('puppeteer');
const { existsSync } = require('fs');
const jsonfile = require('jsonfile');

const wait = t => new Promise((r) => {
  setTimeout(r,t);
});

const GOOGLE_PASSWORD = process.env.GOOGLE_PASSWORD;
const GOOGLE_LOGIN = process.env.GOOGLE_LOGIN;

if (!GOOGLE_PASSWORD || !GOOGLE_LOGIN) {
  console.error('No login data!');
  throw new Error('No login data!');
}

const cookiesFilePath = './cookies.json';

const googleLogin = async (page) => {
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

  // Save Session Cookies
  const cookiesObject = await page.cookies()
  // Write cookies to temp file to be used in other profile pages
  jsonfile.writeFile(cookiesFilePath, cookiesObject, { spaces: 2 },
  function(err) { 
    if (err) {
    console.log('The file could not be written.', err)
    }
    console.log('Session has been successfully saved')
  });
}

// main
(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1366, height: 768})
  await page.goto('https://badoo.com');

  const previousSession = existsSync(cookiesFilePath)
  if (previousSession) {
    // If file exist load the cookies
    const cookiesArr = require(cookiesFilePath)
    if (cookiesArr.length !== 0) {
      for (let cookie of cookiesArr) {
        await page.setCookie(cookie)
      }
      console.log('Session has been loaded in the browser');
      await page.goto('https://badoo.com');
    }
  } else {
    await googleLogin(page);
  }


  await wait(5000);
  await browser.close();
  console.log('done');
})();