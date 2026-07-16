const fs = require('fs');
const path = require('path');

const BASE = 'https://faujiniwas.web.app';

const CITIES = [
  {
    name: 'Pune', slug: 'pune', zone: 'Southern Command', listings: '218+',
    areas: ['Kirkee', 'Khadki', 'Ghorpadi', 'Wanowrie', 'Sopan Baug', 'Salunke Vihar', 'Koregaon Park', 'Camp', 'Lullanagar'],
    landmarks: ['Southern Command HQ', 'Command Hospital Pune', 'Army Public School Pune', 'Army Public School Kirkee', 'Khadki Railway Station', 'CSD Canteen Camp'],
    lat: 18.5204, lng: 73.8567, addressLocality: 'Pune', addressRegion: 'Maharashtra'
  },
  {
    name: 'Delhi', slug: 'delhi', zone: 'Army HQ Zone', listings: '342+',
    areas: ['Delhi Cantonment', 'Kirby Place', 'Brar Square', 'Gopinath Bazaar', 'Naraina', 'Dhaula Kuan', 'Shankar Vihar', 'Subroto Park', 'Palam'],
    landmarks: ['Army Hospital (Research & Referral)', 'Delhi Cantonment', 'Western Air Command', 'Army Public School Delhi Cantt', 'Army Public School Shankar Vihar', 'Air Force School Subroto Park', 'CSD Canteens', 'Delhi Cantt Railway Station'],
    lat: 28.5967, lng: 77.1336, addressLocality: 'New Delhi', addressRegion: 'Delhi'
  },
  {
    name: 'Delhi Cantt', slug: 'locations/delhi-cantt', zone: 'Army HQ Zone', listings: '342+',
    areas: ['Delhi Cantonment', 'Kirby Place', 'Brar Square', 'Gopinath Bazaar', 'Naraina', 'Dhaula Kuan', 'Shankar Vihar', 'Subroto Park', 'Palam'],
    landmarks: ['Army Hospital (Research & Referral)', 'Delhi Cantonment', 'Western Air Command', 'Army Public School Delhi Cantt', 'Army Public School Shankar Vihar', 'Air Force School Subroto Park', 'CSD Canteens', 'Delhi Cantt Railway Station'],
    lat: 28.5967, lng: 77.1336, addressLocality: 'New Delhi', addressRegion: 'Delhi'
  },
  {
    name: 'Ambala', slug: 'ambala', zone: 'Western Command', listings: '156+',
    areas: ['Ambala Cantt', 'Mahesh Nagar', 'Babyal', 'Sadar Bazaar', 'Hill Road', 'Jaggi Colony', 'Model Town'],
    landmarks: ['Western Command HQ', 'Army Public School Ambala', 'Military Hospital Ambala', 'Ambala Cantt Railway Station', 'CSD Canteens'],
    lat: 30.3782, lng: 76.7767, addressLocality: 'Ambala', addressRegion: 'Haryana'
  },
  {
    name: 'Secunderabad', slug: 'secunderabad', zone: 'Southern Command HQ', listings: '184+',
    areas: ['Secunderabad Cantt', 'Trimulgherry', 'Marredpally', 'Bolarum', 'Sainikpuri', 'Karkhana', 'Alwal'],
    landmarks: ['Military Hospital Secunderabad', 'Army Public School Bolarum', 'CSD Canteen Trimulgherry', 'Secunderabad Railway Station'],
    lat: 17.4399, lng: 78.4983, addressLocality: 'Secunderabad', addressRegion: 'Telangana'
  },
  {
    name: 'Bhopal', slug: 'bhopal', zone: 'Central India', listings: '142+',
    areas: ['Bhopal Cantt', 'Lalghati', 'Bairagarh', 'Gandhinagar', 'Neori Hills', 'Kohefiza', 'Arera Colony'],
    landmarks: ['Bhopal Military Station', 'Army Public School Bhopal', 'Military Hospital Bhopal', 'CSD Canteens'],
    lat: 23.2599, lng: 77.4126, addressLocality: 'Bhopal', addressRegion: 'Madhya Pradesh'
  },
  {
    name: 'Kapurthala', slug: 'kapurthala', zone: 'SSB Centre West', listings: '98+',
    areas: ['SSB Centre', 'Kapurthala Cantt', 'Sultanpur Road', 'Urban Estate', 'Model Town', 'Shalimar Bagh'],
    landmarks: ['SSB Centre West', 'Army Public School Kapurthala', 'Military Hospital Kapurthala', 'Kapurthala Station'],
    lat: 31.3833, lng: 75.3833, addressLocality: 'Kapurthala', addressRegion: 'Punjab'
  },
  {
    name: 'Prayagraj', slug: 'prayagraj', zone: 'Selection Centre East', listings: '112+',
    areas: ['Prayagraj Cantt', 'Selection Centre East', 'Muir Road', 'Civil Lines', 'Teliyarganj', 'Ashok Nagar'],
    landmarks: ['Selection Centre East (SCE)', 'Army Public School Prayagraj', 'Military Hospital Prayagraj', 'Prayagraj Junction'],
    lat: 25.4358, lng: 81.8463, addressLocality: 'Prayagraj', addressRegion: 'Uttar Pradesh'
  },
  {
    name: 'Coimbatore', slug: 'coimbatore', zone: 'Southern Command', listings: '89+',
    areas: ['Coimbatore Cantt', 'Red Fields', 'Race Course', 'Ramanathapuram', 'Singanallur', 'Peelamedu'],
    landmarks: ['Coimbatore Military Station', 'Army Public School Coimbatore', 'Command Facilities', 'Coimbatore Junction'],
    lat: 11.0168, lng: 76.9558, addressLocality: 'Coimbatore', addressRegion: 'Tamil Nadu'
  },
  {
    name: 'Bangalore', slug: 'bangalore', zone: 'Southern Command', listings: '201+',
    areas: ['Bangalore Cantt', 'Vasanth Nagar', 'Ulsoor', 'Richards Town', 'Frazer Town', 'Indiranagar', 'Kammanahalli'],
    landmarks: ['Southern Command Station', 'Army Public School K Kamaraj Road', 'Command Hospital Bangalore', 'Bangalore Cantt Station'],
    lat: 12.9716, lng: 77.5946, addressLocality: 'Bangalore', addressRegion: 'Karnataka'
  },
  {
    name: 'Mhow', slug: 'mhow', zone: 'Central Command', listings: '94+',
    areas: ['Mhow Cantt', 'Mayur Nagar', 'Pithampur Road', 'Infantry School Area', 'Civil Lines', 'Subhash Nagar'],
    landmarks: ['Infantry School Mhow', 'Army War College', 'Military Hospital Mhow', 'Army Public School Mhow', 'CSD Canteen Mhow'],
    lat: 22.5523, lng: 75.7614, addressLocality: 'Mhow', addressRegion: 'Madhya Pradesh'
  },
  {
    name: 'Jabalpur', slug: 'jabalpur', zone: 'Central Command', listings: '118+',
    areas: ['Jabalpur Cantt', 'Napier Town', 'Gwarighat Road', 'Gorakhpur', 'Civil Lines', 'Tilwara Ghat'],
    landmarks: ['Army Ordnance Corps Centre', 'Military Hospital Jabalpur', 'Army Public School Jabalpur', 'Jabalpur Cantt Railway Station', 'CSD Canteen'],
    lat: 23.1815, lng: 79.9864, addressLocality: 'Jabalpur', addressRegion: 'Madhya Pradesh'
  },
  {
    name: 'Jodhpur', slug: 'jodhpur', zone: 'South Western Command', listings: '131+',
    areas: ['Jodhpur Cantt', 'Paota', 'Ratanada', 'Shastri Nagar', 'Basni', 'Kudi Bhagtasni', 'Residency Road'],
    landmarks: ['South Western Air Command', 'Military Hospital Jodhpur', 'Army Public School Jodhpur', 'Jodhpur Cantt Station', 'CSD Canteen Jodhpur'],
    lat: 26.2389, lng: 73.0243, addressLocality: 'Jodhpur', addressRegion: 'Rajasthan'
  },
  {
    name: 'Jaipur', slug: 'jaipur', zone: 'South Western Command', listings: '163+',
    areas: ['Jaipur Cantt', 'Civil Lines', 'Bani Park', 'Hasanpura', 'Malviya Nagar', 'Tonk Road', 'Mansarovar'],
    landmarks: ['South Western Command', 'Military Hospital Jaipur', 'Army Public School Jaipur', 'Jaipur Junction', 'CSD Canteen Jaipur'],
    lat: 26.9124, lng: 75.7873, addressLocality: 'Jaipur', addressRegion: 'Rajasthan'
  },
  {
    name: 'Lucknow', slug: 'lucknow', zone: 'Central Command HQ', listings: '177+',
    areas: ['Lucknow Cantt', 'Dilkusha', 'Arjunganj', 'Alambagh', 'Aliganj', 'Gomti Nagar', 'Hazratganj'],
    landmarks: ['Central Command HQ', 'Army Hospital Lucknow', 'Army Public School Lucknow', 'Lucknow Cantt Station', 'CSD Canteen Lucknow'],
    lat: 26.8467, lng: 80.9462, addressLocality: 'Lucknow', addressRegion: 'Uttar Pradesh'
  },
  {
    name: 'Jalandhar', slug: 'jalandhar', zone: 'Western Command', listings: '145+',
    areas: ['Jalandhar Cantt', 'Model Town', 'Urban Estate', 'Millers Ganj', 'Guru Nanak Pura', 'Partap Nagar'],
    landmarks: ['Army Public School Jalandhar', 'Military Hospital Jalandhar', 'CSD Canteen Jalandhar', 'Jalandhar Cantt Railway Station'],
    lat: 31.3260, lng: 75.5762, addressLocality: 'Jalandhar', addressRegion: 'Punjab'
  },
  {
    name: 'Pathankot', slug: 'pathankot', zone: 'Western Command', listings: '87+',
    areas: ['Pathankot Cantt', 'Sarna Nand', 'Chakki Bank', 'Dhar Kalan', 'Civil Lines', 'Shiv Nagar'],
    landmarks: ['Air Force Station Pathankot', 'Military Hospital Pathankot', 'Army Public School Pathankot', 'Pathankot Cantt Station', 'CSD Canteen'],
    lat: 32.2643, lng: 75.6524, addressLocality: 'Pathankot', addressRegion: 'Punjab'
  },
  {
    name: 'Dehradun', slug: 'dehradun', zone: 'Training Command', listings: '195+',
    areas: ['Dehradun Cantt', 'Dalanwala', 'Rajpur Road', 'EC Road', 'Clement Town', 'ONGC Colony', 'Race Course'],
    landmarks: ['Indian Military Academy (IMA)', 'FRI Dehradun', 'Military Hospital Dehradun', 'Army Public School Dehradun', 'Dehradun Station', 'CSD Canteen'],
    lat: 30.3165, lng: 78.0322, addressLocality: 'Dehradun', addressRegion: 'Uttarakhand'
  },
  {
    name: 'Udhampur', slug: 'udhampur', zone: 'Northern Command HQ', listings: '109+',
    areas: ['Udhampur Cantt', 'Ramnagar', 'Tikri', 'New Colony', 'Chenani Road', 'Domail'],
    landmarks: ['Northern Command HQ', 'Military Hospital Udhampur', 'Army Public School Udhampur', 'Udhampur Railway Station', 'CSD Canteen'],
    lat: 32.9283, lng: 75.1424, addressLocality: 'Udhampur', addressRegion: 'Jammu & Kashmir'
  },
  {
    name: 'Chennai', slug: 'chennai', zone: 'Southern Command', listings: '167+',
    areas: ['Pallavaram Cantt', 'St Thomas Mount', 'Guindy', 'Meenambakkam', 'Tambaram', 'Chromepet', 'Perungalathur'],
    landmarks: ['Air Force Station Chennai', 'Military Hospital Chennai', 'Army Public School Chennai', 'CSD Canteen Pallavaram', 'St Thomas Mount Station'],
    lat: 13.0827, lng: 80.2707, addressLocality: 'Chennai', addressRegion: 'Tamil Nadu'
  },
  {
    name: 'Kolkata', slug: 'kolkata', zone: 'Eastern Command HQ', listings: '154+',
    areas: ['Fort William', 'Alipore', 'Ballygunge', 'Tollygunge', 'New Alipore', 'Behala', 'Jadavpur'],
    landmarks: ['Eastern Command HQ Fort William', 'Command Hospital Eastern Command', 'Army Public School Kolkata', 'CSD Canteen Kolkata', 'Howrah Station'],
    lat: 22.5726, lng: 88.3639, addressLocality: 'Kolkata', addressRegion: 'West Bengal'
  },
  {
    name: 'Ranchi', slug: 'ranchi', zone: 'Eastern Command', listings: '91+',
    areas: ['Ranchi Cantt', 'Doranda', 'Morabadi', 'Harmu', 'Lalpur', 'Argora', 'Bariatu'],
    landmarks: ['Jharkhand Armed Police', 'Military Hospital Ranchi', 'Army Public School Ranchi', 'Ranchi Station', 'CSD Canteen Ranchi'],
    lat: 23.3441, lng: 85.3096, addressLocality: 'Ranchi', addressRegion: 'Jharkhand'
  },
  {
    name: 'Danapur', slug: 'danapur', zone: 'Central Command', listings: '103+',
    areas: ['Danapur Cantt', 'Khagaul', 'Saguna More', 'Boring Road', 'Rajendra Nagar', 'Bailey Road'],
    landmarks: ['Danapur Cantonment', 'Army Public School Danapur', 'Military Hospital Danapur', 'Danapur Railway Station', 'CSD Canteen Patna'],
    lat: 25.6205, lng: 85.0478, addressLocality: 'Danapur', addressRegion: 'Bihar'
  },
  {
    name: 'Belgaum', slug: 'belgaum', zone: 'Southern Command', listings: '122+',
    areas: ['Belgaum Cantt', 'Tilakwadi', 'Camp Area', 'Khanapur Road', 'Sadashiv Nagar', 'Nehru Nagar'],
    landmarks: ['Officers Training Academy Belgaum', 'Military Hospital Belgaum', 'Army Public School Belgaum', 'Belgaum Station', 'CSD Canteen'],
    lat: 15.8497, lng: 74.4977, addressLocality: 'Belgaum', addressRegion: 'Karnataka'
  }
];

const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist');
const templatePath = path.join(publicDir, 'city-seo-template.html');

if (!fs.existsSync(templatePath)) {
  console.error('Error: public/city-seo-template.html required.');
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf-8');

function makePillRow(items) {
  return items.map(item => `<span class="pill pill-c">${item}</span>`).join('\n');
}

function makeWhyFaujiniwas(items) {
  return items.map(item => `
    <p style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">
      <span style="color: var(--accent); font-weight: bold;">&#10003;</span>
      <span>${item}</span>
    </p>
  `).join('\n');
}

function generateFaqsHtml(faqs) {
  return faqs.map((faq, idx) => `
    <div class="faq-item">
      <button class="faq-trigger" onclick="toggleFAQ(${idx})">
        <span>${faq.question}</span>
        <span class="faq-icon" id="faq-icon-down-${idx}">&#9660;</span>
        <span class="faq-icon hidden" id="faq-icon-up-${idx}">&#9650;</span>
      </button>
      <div class="faq-content hidden" id="faq-content-${idx}">
        ${faq.answer}
      </div>
    </div>
  `).join('\n');
}

function generateCityPage(html, city) {
  const { name, slug, zone, listings } = city;
  const pageUrl = `${BASE}/${slug}`;
  const citySlugShort = slug.split('/').pop();
  const cantName = `${name} Cantonment`;

  const title = `Rooms & Flats for Rent in ${name} for Defence Families | FaujiNiwas`;
  const description = `Find verified rooms, flats, PGs and houses for rent near ${cantName} for Army, Air Force, Navy and defence families. ${listings} listings. ${zone}. Zero brokerage.`;
  const keywords = `${name} room for rent, ${name} cantonment rental, Army family accommodation ${name}, Defence housing ${name}, Flat for rent ${name} cantt, fauji rent ${citySlugShort}`;
  const ogTitle = `Rooms for Rent in ${name} Cantt | FaujiNiwas`;
  const ogDescription = `Verified rental accommodation near ${cantName} for defence families.`;
  const ogImage = `${BASE}/assets/og-image.webp`;

  // Full 7-schema set for every city
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": `Rooms for Rent in ${name} Cantt`,
      "url": pageUrl,
      "description": description,
      "inLanguage": "en-IN",
      "isPartOf": { "@type": "WebSite", "name": "FaujiNiwas", "url": BASE }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "FaujiNiwas",
      "url": BASE,
      "logo": `${BASE}/logo.png`,
      "description": "India's defence community rental platform connecting military families with verified rental accommodation."
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": BASE,
      "name": "FaujiNiwas",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${BASE}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE },
        { "@type": "ListItem", "position": 2, "name": "Locations", "item": `${BASE}/locations` },
        { "@type": "ListItem", "position": 3, "name": name, "item": pageUrl }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": cantName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city.addressLocality,
        "addressRegion": city.addressRegion,
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": city.lat,
        "longitude": city.lng
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `Can serving Army personnel find rentals near ${name} on FaujiNiwas?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes. Serving personnel, veterans, defence civilians and military families can search and contact property owners directly near ${cantName}.`
          }
        },
        {
          "@type": "Question",
          "name": "Does FaujiNiwas provide government quarters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. FaujiNiwas lists privately owned rental rooms, flats, PGs and houses near defence establishments. It does not allocate or manage government accommodation."
          }
        },
        {
          "@type": "Question",
          "name": "Are listings on FaujiNiwas verified?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Property listings go through verification checks to improve trust and reduce fraudulent listings."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Rental Properties near ${cantName}`,
      "numberOfItems": parseInt(listings),
      "itemListElement": [
        { "@type": "Residence", "name": `1 BHK Flat near ${name} Cantt`, "url": `${BASE}/app.html` },
        { "@type": "Residence", "name": `2 BHK Flat near ${name} Cantt`, "url": `${BASE}/app.html` },
        { "@type": "Residence", "name": `3 BHK House near ${cantName}`, "url": `${BASE}/app.html` }
      ]
    }
  ];

  const schemaMarkupHtml = schemas
    .map(s => `<script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`)
    .join('\n  ');

  const propertyTypes = ['Rooms for Rent', '1 RK', '1 BHK', '2 BHK', '3 BHK', 'Independent House', 'Family PG', 'Shared Accommodation', 'Fully Furnished Flats', 'Semi Furnished Homes'];
  const suitableFor = ['Indian Army Personnel', 'Indian Air Force Personnel', 'Indian Navy Personnel', 'Veterans', 'Ex-Servicemen', 'Defence Civilians', 'Military Families'];
  const whyFaujiniwas = [
    'Built exclusively for the defence community',
    'Verified property listings with photo proof',
    'Direct owner contact — no middleman',
    'Zero brokerage policy enforced',
    `Easy search near ${name} posting station`
  ];

  const faqs = [
    {
      question: `Can serving Army personnel rent through FaujiNiwas near ${name}?`,
      answer: `Yes. Serving personnel, veterans, defence civilians and military families can search and contact property owners directly near ${cantName}.`
    },
    {
      question: 'Does FaujiNiwas provide government quarters?',
      answer: 'No. FaujiNiwas lists privately owned rental rooms, flats, PGs and houses near defence establishments. It does not allocate or manage government accommodation.'
    },
    {
      question: `Are listings verified near ${name}?`,
      answer: 'Property listings go through verification checks to improve trust and reduce fraudulent listings.'
    },
    {
      question: `What is the average rent near ${cantName}?`,
      answer: `Rents near ${cantName} range from Rs.5,000/mo for PG rooms to Rs.25,000/mo for 3 BHK furnished flats depending on proximity and amenities. FaujiNiwas shows live rent data from ${listings} active listings.`
    }
  ];

  const heroH1 = `Rooms & Houses for Rent Near ${cantName}`;
  const heroIntro = `Finding a rental home after a military posting should not be stressful. FaujiNiwas helps serving personnel, veterans, defence civilians, and military families discover verified rooms, flats, PGs, and independent houses near ${cantName}. Whether you're relocating for a permanent posting, temporary duty, or a training course, our platform makes it easier to connect directly with trusted property owners — zero brokerage, AES-256 encrypted, defence-verified.`;

  return html
    .replace(/\{\{TITLE\}\}/g, title)
    .replace(/\{\{DESCRIPTION\}\}/g, description)
    .replace(/\{\{KEYWORDS\}\}/g, keywords)
    .replace(/\{\{ROBOTS\}\}/g, 'index,follow')
    .replace(/\{\{CANONICAL_URL\}\}/g, pageUrl)
    .replace(/\{\{OG_TITLE\}\}/g, ogTitle)
    .replace(/\{\{OG_DESCRIPTION\}\}/g, ogDescription)
    .replace(/\{\{OG_URL\}\}/g, pageUrl)
    .replace(/\{\{OG_IMAGE\}\}/g, ogImage)
    .replace(/\{\{OG_SITE_NAME\}\}/g, 'FaujiNiwas')
    .replace(/\{\{TWITTER_TITLE\}\}/g, ogTitle)
    .replace(/\{\{TWITTER_DESCRIPTION\}\}/g, ogDescription)
    .replace(/\{\{TWITTER_IMAGE\}\}/g, ogImage)
    .replace(/\{\{SCHEMA_MARKUP_HTML\}\}/g, schemaMarkupHtml)
    .replace(/\{\{CITY_NAME\}\}/g, name)
    .replace(/\{\{ZONE\}\}/g, zone)
    .replace(/\{\{LISTINGS\}\}/g, listings)
    .replace(/\{\{CITY_LOWER\}\}/g, encodeURIComponent(citySlugShort))
    .replace(/\{\{HERO_H1\}\}/g, heroH1)
    .replace(/\{\{HERO_INTRO\}\}/g, heroIntro)
    .replace(/\{\{PROPERTY_TYPES_HTML\}\}/g, makePillRow(propertyTypes))
    .replace(/\{\{SUITABLE_FOR_HTML\}\}/g, makePillRow(suitableFor))
    .replace(/\{\{NEARBY_AREAS_HTML\}\}/g, makePillRow(city.areas))
    .replace(/\{\{NEARBY_LANDMARKS_HTML\}\}/g, makePillRow(city.landmarks))
    .replace(/\{\{WHY_FAUJINIWAS_HTML\}\}/g, makeWhyFaujiniwas(whyFaujiniwas))
    .replace(/\{\{FAQS_HTML\}\}/g, generateFaqsHtml(faqs));
}

function writePage(baseDir, slug, content) {
  const targetPath = path.join(baseDir, `${slug}.html`);
  const parentDir = path.dirname(targetPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, content);
  console.log(`Generated: ${targetPath}`);
}

// Generate for public directory (local dev)
CITIES.forEach((city) => {
  const content = generateCityPage(template, city);
  writePage(publicDir, city.slug, content);
});

// Generate in dist (after build)
if (fs.existsSync(distDir)) {
  CITIES.forEach((city) => {
    const content = generateCityPage(template, city);
    writePage(distDir, city.slug, content);
  });
} else {
  console.log('Note: dist/ not found, skipping dist generation. Run npm run build.');
}

console.log(`✅ ${CITIES.length} city SEO pages generated.`);
