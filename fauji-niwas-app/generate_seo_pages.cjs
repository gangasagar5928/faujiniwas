const fs = require('fs');
const path = require('path');

const BASE = 'https://faujiniwas.web.app';

const CITIES = [
  { name: 'Pune', slug: 'pune', zone: 'Southern Command', listings: '218+' },
  { name: 'Delhi', slug: 'delhi', zone: 'Army HQ Zone', listings: '342+' },
  { name: 'Ambala', slug: 'ambala', zone: 'Western Command', listings: '156+' },
  { name: 'Secunderabad', slug: 'secunderabad', zone: 'Southern Command HQ', listings: '184+' },
  { name: 'Bhopal', slug: 'bhopal', zone: 'Central India', listings: '142+' },
  { name: 'Kapurthala', slug: 'kapurthala', zone: 'SSB Centre West', listings: '98+' },
  { name: 'Prayagraj', slug: 'prayagraj', zone: 'Selection Centre East', listings: '112+' },
  { name: 'Coimbatore', slug: 'coimbatore', zone: 'Southern Command', listings: '89+' },
  { name: 'Bangalore', slug: 'bangalore', zone: 'Southern Command', listings: '201+' },
];

const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');
const templatePath = path.join(publicDir, 'city-seo-template.html');

if (!fs.existsSync(templatePath)) {
  console.error('Error: public/city-seo-template.html required.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf-8');

function generateCityPage(html, city) {
  const { name, slug, zone, listings } = city;
  const pageUrl = `${BASE}/${slug}`;
  const title = `Fauji Niwas — Flat for rent in ${name} for Faujis & Defence Housing`;
  const description = `Find verified army housing and rooms for rent for faujis near ${name} cantonment. ${listings} listings. ${zone}. Zero brokerage, AES-256 encrypted.`;
  const keywords = `room for rent ${slug}, fauji rent ${slug}, ${slug} cantonment housing, defence housing ${slug}, army quarters ${slug}, SSB dorms ${slug}`;

  const ldJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    url: pageUrl,
    description,
    about: {
      '@type': 'Place',
      name: `${name} Cantonment Area`,
      address: { '@type': 'PostalAddress', addressLocality: name, addressCountry: 'IN' },
    },
    provider: {
      '@type': 'Organization',
      name: 'Fauji Niwas',
      url: BASE,
    },
  });

  return html
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{DESCRIPTION\}\}/g, description)
    .replace(/\{\{KEYWORDS\}\}/g, keywords)
    .replace(/\{\{CANONICAL_URL\}\}/g, pageUrl)
    .replace(/\{\{JSON_LD\}\}/g, ldJson)
    .replace(/\{\{CITY_NAME\}\}/g, name)
    .replace(/\{\{ZONE\}\}/g, zone)
    .replace(/\{\{LISTINGS\}\}/g, listings)
    .replace(/\{\{CITY_LOWER\}\}/g, encodeURIComponent(slug));
}

// Generate for public directory (so local dev and direct hosting works)
CITIES.forEach((city) => {
  const content = generateCityPage(template, city);
  fs.writeFileSync(path.join(publicDir, `${city.slug}.html`), content);
  console.log(`Generated public/${city.slug}.html (${city.name})`);
});

// If dist exists (after a build), generate in dist as well
if (fs.existsSync(distDir)) {
  CITIES.forEach((city) => {
    const content = generateCityPage(template, city);
    fs.writeFileSync(path.join(distDir, `${city.slug}.html`), content);
    console.log(`Generated dist/${city.slug}.html (${city.name})`);
  });
} else {
  console.log('Note: dist/ not found, skipping dist generation. Run npm run build.');
}

console.log(`✅ ${CITIES.length} city SEO pages generated.`);
