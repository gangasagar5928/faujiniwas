const fs = require('fs');

const parsedData = JSON.parse(fs.readFileSync('parsed_data.json', 'utf8'));
let dataJs = fs.readFileSync('src/data.js', 'utf8');

const replaceConst = (content, constName, newData) => {
    const regex = new RegExp(`export const ${constName} = \\{[\\s\\S]*?\\};`, 'm');
    const newStr = `export const ${constName} = ${JSON.stringify(newData, null, 4)};`;
    return content.replace(regex, newStr);
};

dataJs = replaceConst(dataJs, 'ARMY_SCHOOLS', parsedData.schools);
dataJs = replaceConst(dataJs, 'MILITARY_HOSPITALS', parsedData.hospitalsData);
dataJs = replaceConst(dataJs, 'CANTEENS', parsedData.canteensData);

fs.writeFileSync('src/data.js', dataJs);
console.log('Updated src/data.js successfully.');
