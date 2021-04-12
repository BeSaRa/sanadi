const fs = require('fs');

const [, , fileName, envName] = process.argv;
if (!envName) {
  throw Error('There is no ENV Provided');
}
const filePath = './dist/sanadi/' + fileName;
const fileData = fs.readFileSync(filePath, 'utf8');
let json = JSON.parse(fileData);
json.BASE_ENVIRONMENT = envName;
fs.writeFileSync(filePath, JSON.stringify(json, null, " "), 'utf8');
