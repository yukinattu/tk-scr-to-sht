const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape(account) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto(`https://www.tiktok.com/@${account}`, {waitUntil: 'domcontentloaded'});

  const data = {
    date: new Date().toISOString().split('T')[0],
    username: account,
    full_name: await page.$eval('.user-title', el => el.textContent.trim()),
    video_url: await page.$eval('.browse-video-link', el => el.getAttribute('href')),
    video_title: await page.$eval('.video-detail-desc', el => el.textContent.trim()),
    views: await page.$eval('.css-1dr5cmz-DivPlayCount', el => el.textContent.trim()),
    likes: await page.$eval('.css-1mizm9b-ButtonActionItem .css-vc3yj-StrongText', el => el.textContent.trim()),
    comments: await page.$eval('.css-1mizm9b-ButtonActionItem .css-vc3yj-StrongText', el => el.textContent.trim()),
    shares: await page.$eval('.css-1mizm9b-ButtonActionItem .css-vc3yj-StrongText', el => el.textContent.trim()),
    downloads: '', // 未取得
    favourites: '', // 未取得
    engagement: '', // 未取得
    duration: '', // 未取得
    hashtags: '', // 未取得
  };
  
  await browser.close();
  return data;
}

(async () => {
  const accounts = ["riachan_ganbaru", "nenechann07"]; //取得したいアカウント
  const results = [];
  for (let account of accounts) {
    results.push(await scrape(account));
  }
  fs.writeFileSync('./data.json', JSON.stringify(results, null, 2));
})();
