#!/usr/bin/env node

import { existsSync, writeFileSync, readFileSync } from "fs";
import { resolve, join, dirname } from "path";
import { Checker } from "./";

if (
    process.argv.findIndex((arg) => arg === "--version") !== -1 ||
    process.argv.findIndex((arg) => arg === "-v") !== -1 ||
    process.argv.findIndex((arg) => arg === "-V") !== -1
) {
    console.log("testcase-x version: " + "\u001b[1;93m" + require("../package.json").version + "\u001b[0m");
    console.log(
        "Usage: testcase-x --recipe [recipe path] --testcase [testcase path] --output [report path] --preprocessor [preprocessor path] --source [source path] [source path 2] ...",
    );
    console.log("\t--recipe (-r): Recipe JS File Path.");
    console.log("\t--testcase (-t): Testcase File Path.");
    console.log("\t--output (-o): Output File Path.");
    console.log("\t--preprocessor (-p): Preprocessor JS File Path.");
    console.log("\t--source (-s): Source File Path.");
    console.log("\t--version (-V) or (-v): Show version.");
    console.log("Homepage: " + "\u001b[94m" + require("../package.json").homepage + "\u001b[0m");
    process.exit(0);
}

let recipePath = resolve("recipe.js"),
    testcasePath = "",
    outputPath = "",
    preprocessorPath = "",
    sourcePath: string[] = [];
if (process.argv.findIndex((arg) => arg === "--recipe") !== -1 || process.argv.findIndex((arg) => arg === "-r") !== -1) {
    recipePath =
        process.argv[
            process.argv.findIndex((arg) => arg === "--recipe") === -1
                ? process.argv.findIndex((arg) => arg === "-r") + 1
                : process.argv.findIndex((arg) => arg === "--recipe") + 1
        ];
}
if (process.argv.findIndex((arg) => arg === "--testcase") !== -1 || process.argv.findIndex((arg) => arg === "-t") !== -1) {
    testcasePath =
        process.argv[
            process.argv.findIndex((arg) => arg === "--testcase") === -1
                ? process.argv.findIndex((arg) => arg === "-t") + 1
                : process.argv.findIndex((arg) => arg === "--testcase") + 1
        ];
}
if (process.argv.findIndex((arg) => arg === "--output") !== -1 || process.argv.findIndex((arg) => arg === "-o") !== -1) {
    outputPath =
        process.argv[
            process.argv.findIndex((arg) => arg === "--output") === -1
                ? process.argv.findIndex((arg) => arg === "-o") + 1
                : process.argv.findIndex((arg) => arg === "--output") + 1
        ];
}
if (process.argv.findIndex((arg) => arg === "--preprocessor") !== -1 || process.argv.findIndex((arg) => arg === "-p") !== -1) {
    preprocessorPath =
        process.argv[
            process.argv.findIndex((arg) => arg === "--preprocessor") === -1
                ? process.argv.findIndex((arg) => arg === "-p") + 1
                : process.argv.findIndex((arg) => arg === "--preprocessor") + 1
        ];
}
if (process.argv.findIndex((arg) => arg === "--source") !== -1 || process.argv.findIndex((arg) => arg === "-s") !== -1) {
    let start =
        process.argv.findIndex((arg) => arg === "--source") === -1
            ? process.argv.findIndex((arg) => arg === "-s") + 1
            : process.argv.findIndex((arg) => arg === "--source") + 1;
    for (let i = start; i < process.argv.length; i++) {
        if (!process.argv[i].startsWith("-")) sourcePath.push(process.argv[i]);
        else break;
    }
}

if (recipePath) recipePath = resolve(recipePath);
if (testcasePath) testcasePath = resolve(testcasePath);
if (outputPath) outputPath = resolve(outputPath);
if (preprocessorPath) preprocessorPath = resolve(preprocessorPath);
for (let i = 0; i < sourcePath.length; i++) sourcePath[i] = resolve(sourcePath[i]);

if ((!recipePath || !existsSync(recipePath)) && (!testcasePath || !existsSync(testcasePath))) {
    console.log("\u001b[1;91m" + "Recipe or Testcase File Not Found." + "\u001b[0m");
    process.exit(1);
}
if (sourcePath.length === 0) {
    console.log("\u001b[1;91m" + "No Source File Provided." + "\u001b[0m");
    process.exit(1);
}
for (let i = 0; i < sourcePath.length; i++) {
    if (!existsSync(sourcePath[i])) {
        console.log("\u001b[1;91m" + "Source File Not Found. " + sourcePath[i] + "\u001b[0m");
        process.exit(1);
    }
}

check();

async function check() {
    const StartT = Date.now();
    const checker = new Checker();
    if (recipePath) checker.genTestcase(require(resolve(recipePath)));
    else checker.testcase(readFileSync(resolve(testcasePath), "utf-8"));
    for (let i = 0; i < sourcePath.length; i++) checker.source(readFileSync(resolve(sourcePath[i]), "utf-8"));
    if (preprocessorPath) checker.setPreprocessor(require(resolve(preprocessorPath)));
    const result = await checker.go();

    if (!outputPath) outputPath = join(dirname(recipePath || testcasePath), `result.${checker.id}.json`);
    writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log("\u001b[1;94m" + `Cross Check Finished in ${((Date.now() - StartT) / 1000).toFixed(2)}s.` + "\u001b[0m");
}
