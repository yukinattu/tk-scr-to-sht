const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape(account) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();
  await page.goto(`https://www.tiktok.com/@${account}`, {
    waitUntil: 'domcontentloaded'
  });

  // __NEXT_DATA__からデータ取得
  const content = await page.content();
  const match = content.match(/<script id="__NEXT_DATA__".*?>(.*?)<\/script>/);
  let data = {
    date: new Date().toISOString().split('T')[0],
    username: account,
    full_name: '',       // jsonDataから取得できれば後で追加
    video_url: '',       // jsonDataから取得できれば後で追加
    video_title: '',     // jsonDataから取得できれば後で追加
    views: '',           // jsonDataから取得できれば後で追加
    likes: '',           // jsonDataから取得できれば後で追加
    comments: '',        // jsonDataから取得できれば後で追加
    shares: '',          // jsonDataから取得できれば後で追加
    downloads: '',       // 未取得
    favourites: '',      // 未取得
    engagement: '',      // 未取得
    duration: '',        // 未取得
    hashtags: ''         // jsonDataから取得できれば後で追加
  };
  
  if (match && match[1]) {
    const jsonData = JSON.parse(match[1]);
    // ★★ ここで、取得した jsonData から値を取得できれば取得 ★★
    // console.log(jsonData) して取得できそうならデータ取得処理追加
  } else {
    console.error("`__NEXT_DATA__`が見つかりませんでした。");
  }

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
