const fs = require('fs');
const csv = require('csv-parser');

const CSV_FILE_PATH = '/Users/harshilvasoya/Documents/delete_karva_id_1.csv';

const results = [];

fs.createReadStream(CSV_FILE_PATH)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results);
  });

console.log(results);
