var isRun = true;
const getRun = () => {
    return isRun;
}
const setRun = v => {
    isRun = v;
}

module.exports = {getRun, setRun};