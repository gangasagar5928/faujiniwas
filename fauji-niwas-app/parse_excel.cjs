const xlsx = require('xlsx');
const fs = require('fs');

const parseSchools = () => {
    const workbook = xlsx.readFile('C:/Users/mksin/Downloads/APS_AFS_KV_School_Coordinates.xlsx');
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    const schoolsData = [];
    data.forEach(row => {
        schoolsData.push({
            name: row['Facility Name'] || row['Name'] || row['name'] || 'Unknown School',
            type: row['Category'] || row['Type'] || row['type'],
            state: row['State / UT'] || 'Unknown',
            lat: parseFloat(row['Latitude'] || row['Lat'] || row['lat']),
            lng: parseFloat(row['Longitude'] || row['Lng'] || row['lng'] || row['Long'] || row['long'])
        });
    });
    return schoolsData;
};

const parseHospitalsAndCSD = () => {
    const workbook = xlsx.readFile('C:/Users/mksin/Downloads/CSD_MH_Command_Hospitals_India.xlsx');
    
    const hospitalsData = [];
    const canteensData = [];
    
    workbook.SheetNames.forEach(sheetName => {
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        if (data.length === 0) return;
        
        data.forEach(row => {
            const name = row['Facility Name'] || row['Name'] || row['name'] || 'Unknown';
            const cat = row['Category'] || row['Type'] || row['type'] || '';
            const isHospital = sheetName.toLowerCase().includes('hospital') || cat.toLowerCase().includes('hospital') || name.toLowerCase().includes('hospital') || name.toLowerCase().includes('mh');
            
            const item = {
                name: name,
                type: cat || (isHospital ? 'MH' : 'CSD'),
                state: row['State / UT'] || 'Unknown',
                lat: parseFloat(row['Latitude'] || row['Lat'] || row['lat']),
                lng: parseFloat(row['Longitude'] || row['Lng'] || row['lng'] || row['Long'] || row['long'])
            };
            
            if (isHospital) {
                hospitalsData.push(item);
            } else {
                canteensData.push(item);
            }
        });
    });
    
    return { hospitalsData, canteensData };
};

try {
    const schools = parseSchools();
    const { hospitalsData, canteensData } = parseHospitalsAndCSD();
    
    fs.writeFileSync('parsed_data.json', JSON.stringify({ schools, hospitalsData, canteensData }, null, 2));
    console.log('Successfully parsed Excel files into parsed_data.json');
} catch (e) {
    console.error('Error parsing files:', e);
}
