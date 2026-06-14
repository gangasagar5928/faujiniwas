const fs = require('fs');
const path = require('path');

const cities = ['Pune', 'Delhi', 'Ambala', 'Secunderabad', 'Bhopal', 'Kapurthala', 'Prayagraj', 'Coimbatore', 'Bangalore'];

const templatePath = path.join(__dirname, 'index.html');
const publicDir = path.join(__dirname, 'public');

const template = fs.readFileSync(templatePath, 'utf-8');

// Copy index.html to public/index.html so it gets served by Firebase
fs.writeFileSync(path.join(publicDir, 'index.html'), template);
console.log('Copied index.html to public/');

cities.forEach(city => {
    let content = template.replace(
        /<title>.*<\/title>/,
        `<title>Fauji Niwas — Flat for rent in ${city} for Faujis & Defence Housing</title>`
    );
    content = content.replace(
        /<meta name="description" content=".*">/,
        `<meta name="description" content="Fauji Niwas is India's #1 exclusive platform for defence personnel. Find verified army housing, room for rent for faujis, flats, and SSB dorms near cantonment areas in ${city}. Zero brokerage. Founded by Aman Kumar Singh.">`
    );
    
    // Inject canonical URL to prevent duplicate content penalties
    content = content.replace(
        /<\/head>/,
        `    <link rel="canonical" href="https://faujiniwas.web.app/${city.toLowerCase()}.html">\n</head>`
    );

    const fileName = city.toLowerCase() + '.html';
    fs.writeFileSync(path.join(publicDir, fileName), content);
    console.log(`Generated ${fileName}`);
});
