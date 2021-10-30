module.exports = (output) => {
    output.stdout = output.stdout.toLowerCase();
    if (output.code === 1 || output.stdout.indexOf("error") !== -1) return "!ERROR 1";
    const HCP = +output.stdout.match(/(\d+)\s?pts/)[1];
    const Suits = output.stdout
        .match(/\d+-\d+-\d+-\d+/)[0]
        .split("-")
        .map(Number);
    const Choice = output.stdout.match(/choice\s?:\s?(\w+)/)[1].trim();
    return `${HCP} ${Suits.join(" ")} ${Choice}`;
};
