const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape(account) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto(`https://www.tiktok.com/@${account}`);

  // ★取得例：後で実データ取得ロジックへ変更
  const data = {
    date: new Date().toISOString().split('T')[0],
    username: account,
    full_name: '', //後で取得
    video_url: '', //後で取得
    video_title: '', //後で取得
    views: '', 
    likes: '', 
    comments: '', 
    shares: '', 
    downloads: '', 
    favourites: '', 
    engagement: '', 
    duration: '', 
    hashtags: '' 
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
