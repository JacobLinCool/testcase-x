// use testcase-gen package

function cards() {
    const all = Array.from({ length: 52 }, (_, i) => i + 1);
    const shuffled = all.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 13);
}

const rules = [
    {
        name: "Testcases",
        generator: () => cards().join(" "),
        repeat: 1000,
    },
];

module.exports = rules;
