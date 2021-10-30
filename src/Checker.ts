import { report, result, Runner } from "testcase-run";
import { Generator, recipe, testcase } from "testcase-gen";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { testResults, testResult } from "./types";

class Checker {
    public id: number;
    public testcases: testcase[] = [];
    public sources: string[] = [];
    public preprocessor: Function = (output: result) => output.stdout.trim();

    constructor() {
        this.id = Math.floor(Math.random() * 1000000);
    }

    public testcase(tc: testcase[] | string): Checker {
        if (typeof tc === "string") {
            try {
                tc = JSON.parse(tc);
                if (!Array.isArray(tc)) throw new Error("");
            } catch (err) {
                tc = [
                    {
                        id: 0,
                        name: "TESTCASE",
                        testcase: tc as string,
                    },
                ];
            }
        }
        this.testcases = tc as testcase[];
        return this;
    }

    public genTestcase(rules: recipe[]): Checker {
        const gen = new Generator(rules);
        this.testcases = gen.gen() as testcase[];
        return this;
    }

    public source(src: string): Checker {
        this.sources.push(src);
        return this;
    }

    public setPreprocessor(preprocessor: Function = this.preprocessor): Checker {
        this.preprocessor = preprocessor;
        return this;
    }

    public async go({ timeout = 1000, core = 100 }: { timeout?: number; core?: number } = {}) {
        const tmpDir = join(process.cwd(), `tc-tmp-${this.id}`);
        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

        try {
            for (let i = 0; i < this.sources.length; i++) {
                const srcPath = join(tmpDir, `source_${i}.c`);
                writeFileSync(srcPath, this.sources[i]);
            }
            this.log("Copied Sources.");

            for (let i = 0; i < this.sources.length; i++) {
                const gcc = `gcc -o ./out_${i}${process.platform === "win32" ? ".exe" : ""} ./source_${i}.c`;
                execSync(gcc, { cwd: tmpDir });
            }
            this.log("Compiled Sources.");

            const reports: report[][] = [];
            for (let i = 0; i < this.sources.length; i++) {
                this.log(`Running Testcase for Source ${i}`);
                const runner = new Runner(this.testcases);
                reports.push(await runner.run(join(tmpDir, `out_${i}${process.platform === "win32" ? ".exe" : ""}`), { timeout, core }));
            }
            this.log("Runs Finished.");

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
            this.log("Diff Analysis Finished.");
            this.log(
                "There are",
                Object.values(diff).reduce((acc, cur) => acc + cur.length, 0),
                "different results between",
                this.sources.length,
                "sources.",
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
}

export default Checker;
