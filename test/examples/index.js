const fs = require('fs');
const path = require('path');

const apiDir = __dirname;
let apis = fs.readdirSync(apiDir).filter(file => fs.lstatSync(path.join(apiDir, file)).isDirectory());
apis.forEach(api => {
    require(`${apiDir}/${api}`);
});
