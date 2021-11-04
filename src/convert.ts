import { testcase } from "testcase-gen";

export default function string2testcases(str: string): testcase[] {
    try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) throw new Error("");
        return parsed;
    } catch (err) {
        return [
            {
                id: 0,
                name: "TESTCASE",
                testcase: str as string,
            },
        ];
    }
}
