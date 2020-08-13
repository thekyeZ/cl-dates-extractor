// const pdf = require("pdfreader");
const fs = require("fs");
const pdf = require("pdf-parse");

let dataBuffer = fs.readFileSync("1.pdf");
pdf(dataBuffer).then(function (data) {
  //return el.match(/((\d\d\.\d\d\.\d\d\d\d)|(\d:\d\d-\d\d\:\d\d))/gm);

  let arr = data.text.split(/[1-9]{1,2} {1}\n/gm);
  let tmp = arr
    .filter((el) => !el.includes("przerwa") && !el.includes('Scrum Lab'))
    .filter((el) => el.length);
  let tmp2 = [tmp[1], tmp[2], tmp[3], tmp[4]];

  tmp.forEach((el) => {
    extract(el.replace(/^\s*\n/gm, ""));
  });

  tmp2.forEach((el) => {
    let content = "------------------------\n";
    content += el.replace(/^\s*\n/gm, "");
    fs.appendFileSync("test.txt", content);
  });
});

function extract(str) {
  console.log(str.match(/((\d\d\.\d\d\.\d\d\d\d)|(\d:\d\d-\d\d\:\d\d)|[2|4]h)/gm));
}
