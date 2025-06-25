const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape(account) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto(`https://www.tiktok.com/@${account}`, {waitUntil: 'domcontentloaded'});

  // ★取得例：後で取得ロジックへ変更
  const data = {
    date: new Date().toISOString().split('T')[0],
    username: account,
    full_name: await page.$eval('.user-name-selector', el => el.textContent.trim()),
    video_url: await page.$eval('.video-selector', el => el.getAttribute('href')),
    video_title: await page.$eval('.title-selector', el => el.textContent.trim()),
    views: await page.$eval('.views-selector', el => el.textContent.trim()),
    likes: await page.$eval('.likes-selector', el => el.textContent.trim()),
    comments: await page.$eval('.comments-selector', el => el.textContent.trim()),
    shares: await page.$eval('.shares-selector', el => el.textContent.trim()),
    downloads: await page.$eval('.downloads-selector', el => el.textContent.trim()),
    favourites: await page.$eval('.favourites-selector', el => el.textContent.trim()),
    engagement: '', // engagementの取得ルールが必要
    duration: '', // durationの取得ルールが必要
    hashtags: '', // hashtagsの取得ルールが必要
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
