const fs  = require("fs");
var fn    = process.argv[2]
var code  = fs.readFileSync(fn).toString();
var lines = code.split("\n");
lines = lines.filter(ln=>!ln.includes('DEBUG'));
console.log(lines.join("\n"));
