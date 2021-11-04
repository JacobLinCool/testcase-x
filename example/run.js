const { writeFileSync, readFileSync } = require("fs");
const { join } = require("path");
const { Checker } = require("../lib");

const c = new Checker()
    .source(readFileSync(join(__dirname, "jacob.c"), "utf8"))
    .source(readFileSync(join(__dirname, "how.c"), "utf8"))
    .genTestcase(require("./testcase.js"))
    .setPreprocessor(require("./preprocessor.js"));

c.on("TMP_DIR_CREATED", () => null)
    .on("SOURCE_COPIED", () => null)
    .on("SOURCES_COPIED", () => console.log("COPIED"))
    .on("SOURCE_COMPILED", () => null)
    .on("SOURCES_COMPILED", () => console.log("COMPILED"))
    .on("TESTCASE_STARTED", (i) => console.log(`RUNNING PROGRAM ${i}`))
    .on("TESTCASE_FINISHED", (i) => console.log(`FINISHED PROGRAM ${i}`))
    .on("TESTCASES_FINISHED", () => console.log("ALL PROGRAMS FINISHED"))
    .on("DIFF_ANALYSIS_FINISHED", () => console.log("DIFF ANALYSIS FINISHED"));

c.go().then((diff) => {
    writeFileSync(join(__dirname, "result.json"), JSON.stringify(diff, null, 2));
});
