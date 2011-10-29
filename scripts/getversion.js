var fs = require('fs'),
    pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8'));

console.log(pkg.version);
