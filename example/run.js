const { writeFileSync, readFileSync } = require("fs");
const { join } = require("path");
const { Checker } = require("../lib");

const c = new Checker()
    .source(readFileSync(join(__dirname, "jacob.c"), "utf8"))
    .source(readFileSync(join(__dirname, "how.c"), "utf8"))
    .genTestcase(require("./testcase.js"))
    .setPreprocessor(require("./preprocessor.js"));

c.go().then((diff) => {
    writeFileSync(join(__dirname, "result.json"), JSON.stringify(diff, null, 2));
});
