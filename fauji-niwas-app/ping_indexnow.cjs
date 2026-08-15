const fs = require('fs');
const path = require('path');
const https = require('https');

function pingIndexNow(customUrls) {
  let urlList = customUrls;

  if (!urlList || !urlList.length) {
    const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const xml = fs.readFileSync(sitemapPath, 'utf-8');
      const matches = xml.match(/<loc>(.*?)<\/loc>/g);
      if (matches) {
        urlList = matches.map(m => m.replace(/<\/?loc>/g, ''));
      }
    }
  }

  if (!urlList || !urlList.length) {
    urlList = [
      'https://faujiniwas.web.app/',
      'https://faujiniwas.web.app/about',
      'https://faujiniwas.web.app/aman-kumar-singh',
      'https://faujiniwas.web.app/pune',
      'https://faujiniwas.web.app/delhi'
    ];
  }

  const data = JSON.stringify({
    host: 'faujiniwas.web.app',
    key: '86a2a04fab0046d2ba1beee8562ab4ed',
    keyLocation: 'https://faujiniwas.web.app/86a2a04fab0046d2ba1beee8562ab4ed.txt',
    urlList: urlList
  });

  console.log(`Sending IndexNow payload (${urlList.length} URLs) to Bing Webmaster...`);

  const options = {
    hostname: 'api.indexnow.org',
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`IndexNow response code: ${res.statusCode}`);
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });

  req.on('error', (error) => {
    console.error('IndexNow ping failed:', error);
  });

  req.write(data);
  req.end();
}

if (require.main === module) {
  pingIndexNow();
}

module.exports = pingIndexNow;
