export interface testResult {
    testcase: string;
    stdouts: any[];
}

export interface testResults {
    [key: string]: testResult[];
}

export interface checkOptions {
    timeout?: number;
    core?: number;
    gccFlags?: string[];
    cwd?: string;
}

export type checkEvents =
    | "TMP_DIR_CREATED"
    | "SOURCE_COPIED"
    | "SOURCES_COPIED"
    | "SOURCE_COMPILED"
    | "SOURCES_COMPILED"
    | "TESTCASE_STARTED"
    | "TESTCASE_FINISHED"
    | "TESTCASES_FINISHED"
    | "DIFF_ANALYSIS_FINISHED";
