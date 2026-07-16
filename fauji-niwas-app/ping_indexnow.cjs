const https = require('https');

const data = JSON.stringify({
  host: 'faujiniwas.web.app',
  key: '86a2a04fab0046d2ba1beee8562ab4ed',
  keyLocation: 'https://faujiniwas.web.app/86a2a04fab0046d2ba1beee8562ab4ed.txt',
  urlList: [
    'https://faujiniwas.web.app/',
    'https://faujiniwas.web.app/about.html',
    'https://faujiniwas.web.app/aman-kumar-singh.html',
    'https://faujiniwas.web.app/amankumarsingh.html'
  ]
});

console.log('Sending IndexNow payload to Bing Webmaster...');

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
