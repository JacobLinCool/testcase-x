export interface testResult {
    testcase: string;
    stdouts: any[];
}

export interface testResults {
    [key: string]: testResult[];
}
