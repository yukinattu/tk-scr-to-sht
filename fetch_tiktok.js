const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

async function scrape(account) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/" + (Math.floor(Math.random() * 20) + 90) + ".0.0.0 Safari/537.36"
  );
  await page.goto(`https://www.tiktok.com/@${account}`, {
    waitUntil: "networkidle2",
    timeout: 0
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // ★ ボット検知チェック
  const isPuzzle = await page.evaluate(() => {
    return (
      document.body.innerText.includes("Verify to continue") ||
      !!document.querySelector('#captcha-container') ||
      !!document.querySelector("div[data-e2e='captcha-page']")
    );
  });
  if (isPuzzle) {
    console.error(`[${account}] ⚠️ ボット検知（パズル）発生！取得できません。`);
    await browser.close();
    return null;
  }

  // ★ B方式：__NEXT_DATA__取得
  const nextData = await page.evaluate(() => {
    const el = document.querySelector('#__NEXT_DATA__');
    return el ? el.textContent : null;
  });

  let data = {
    date: new Date().toISOString().split("T")[0],
    username: account,
    full_name: '',           // jsonDataから取得できれば後で追加
    video_url: '',           // jsonDataから取得できれば後で追加
    video_title: '',         // jsonDataから取得できれば後で追加
    views: '',                // jsonDataから取得できれば後で追加
    likes: '',                // jsonDataから取得できれば後で追加
    comments: '',             // jsonDataから取得できれば後で追加
    shares: '',               // jsonDataから取得できれば後で追加
    downloads: '',            // 未取得
    favourites: '',           // 未取得
    engagement: '',           // 未取得
    duration: '',             // 未取得
    hashtags: ''              // jsonDataから取得できれば後で追加
  };
  
  if (nextData) {
    try {
      const jsonData = JSON.parse(nextData);
      console.log(`[${account}] ✅ __NEXT_DATA__取得成功！`);

      // ★例：userデータ取得
      const userData = jsonData?.props?.pageProps?.user;
      if (userData) {
        data.full_name = userData?.nickname || '';
      }
    } catch (error) {
      console.error(`[${account}] JSON.parseエラー:`, error);
    }
  } else {
    console.error(`[${account}] ❌ __NEXT_DATA__が見つかりませんでした。`);
  }

  await browser.close();
  return data;
}

(async () => {
  const accounts = ["riachan_ganbaru", "nenechann07"]; //取得したいアカウント
  const results = [];
  for (let account of accounts) {
    const result = await scrape(account);
    if (result) results.push(result);
  }

  console.log("取得したデータ:", JSON.stringify(results, null, 2));
  fs.writeFileSync('./data.json', JSON.stringify(results, null, 2));
})();
