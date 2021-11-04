import { testResults, checkOptions, checkEvents } from "./types";
import { report, result, Runner } from "testcase-run";
import { Generator, recipe, testcase } from "testcase-gen";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { EventEmitter } from "events";
import string2testcases from "./convert";

class Checker extends EventEmitter {
    public id: number;
    public testcases: testcase[] = [];
    public sources: string[] = [];
    public preprocessor: Function = (output: result) => output.stdout.trim();

    constructor() {
        super();
        this.id = Math.floor(Math.random() * 1000000);
        this.defaultListeners();
    }

    public testcase(tc: testcase[] | string): this {
        if (typeof tc === "string") tc = string2testcases(tc);
        this.testcases = tc as testcase[];
        return this;
    }

    public genTestcase(rules: recipe[]): this {
        const gen = new Generator(rules);
        this.testcases = gen.gen() as testcase[];
        return this;
    }

    public source(src: string): this {
        this.sources.push(src);
        return this;
    }

    public setPreprocessor(preprocessor: Function = this.preprocessor): this {
        this.preprocessor = preprocessor;
        return this;
    }

    public async go({ timeout = 1000, core = 100, gccFlags = ["-static", "-O2", "-lm", "-std=gnu99"], cwd = process.cwd() }: checkOptions = {}) {
        const tmpDir = join(cwd, `tc-tmp-${this.id}`);
        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
        this.emit("TMP_DIR_MADE", tmpDir);

        try {
            for (let i = 0; i < this.sources.length; i++) {
                const srcPath = join(tmpDir, `source_${i}.c`);
                writeFileSync(srcPath, this.sources[i]);
                this.emit("SOURCE_COPIED", i, srcPath);
            }
            this.emit("SOURCES_COPIED");

            for (let i = 0; i < this.sources.length; i++) {
                const gcc = `gcc ${gccFlags.join(" ")} -o ./out_${i}${process.platform === "win32" ? ".exe" : ""} ./source_${i}.c`;
                execSync(gcc, { cwd: tmpDir });
                this.emit("SOURCE_COMPILED", i, join(tmpDir, `out_${i}${process.platform === "win32" ? ".exe" : ""}`));
            }
            this.emit("SOURCES_COMPILED");

            const reports: report[][] = [];
            for (let i = 0; i < this.sources.length; i++) {
                const runner = new Runner(this.testcases);
                const exec = join(tmpDir, `out_${i}${process.platform === "win32" ? ".exe" : ""}`);
                this.emit("TESTCASE_STARTED", i, exec);
                reports.push(await runner.run(exec, { timeout, core }));
                this.emit("TESTCASE_FINISHED", i, exec);
            }
            this.emit("TESTCASES_FINISHED");

            const diff: testResults = {},
                same: testResults = {};
            for (let i = 0; i < this.testcases.length; i++) {
                const tcName = this.testcases[i].name;
                const tcs = this.testcases[i].testcase
                    .split("\n\n")
                    .map((x) => x.trim())
                    .filter((x) => x.length > 0);
                diff[tcName] = [];
                same[tcName] = [];
                for (let j = 0; j < tcs.length; j++) {
                    const tc = tcs[j];
                    const stdouts = reports.map((report) => this.preprocessor(report[i].results[j]));

                    if (stdouts.some((x) => x !== stdouts[0])) diff[tcName].push({ testcase: tc, stdouts });
                    else same[tcName].push({ testcase: tc, stdouts });
                }
            }
            this.emit(
                "DIFF_ANALYSIS_FINISHED",
                Object.values(diff).reduce((acc, cur) => acc + cur.length, 0),
                Object.values(same).reduce((acc, cur) => acc + cur.length, 0),
            );
            return { diff, same };
        } catch (err) {
            this.log("ERROR", err);
        } finally {
            rmSync(tmpDir, { recursive: true });
        }

        return null;
    }

    private log(...msg: any[]) {
        console.log(`[Checker ${this.id}]`, ...msg);
    }

    public defaultListeners() {
        this.on("TMP_DIR_CREATED", (dir) => this.log("TMP_DIR_CREATED", dir));
        this.on("SOURCE_COPIED", (i, srcPath) => this.log("SOURCE_COPIED", i, srcPath));
        this.on("SOURCES_COPIED", () => this.log("SOURCES_COPIED"));
        this.on("SOURCE_COMPILED", (i, exec) => this.log("SOURCE_COMPILED", i, exec));
        this.on("SOURCES_COMPILED", () => this.log("SOURCES_COMPILED"));
        this.on("TESTCASE_STARTED", (i, exec) => this.log("TESTCASE_STARTED", i, exec));
        this.on("TESTCASE_FINISHED", (i, exec) => this.log("TESTCASE_FINISHED", i, exec));
        this.on("TESTCASES_FINISHED", () => this.log("TESTCASES_FINISHED"));
        this.on("DIFF_ANALYSIS_FINISHED", (diffs, sames) => {
            this.log("DIFF_ANALYSIS_FINISHED");
            this.log(`There are ${diffs} different results and ${sames} same results between ${this.sources.length} sources.`);
        });
    }

    public on(event: checkEvents, listener: (...args: any[]) => void): this {
        super.on(event, listener);
        return this;
    }
}

export default Checker;
