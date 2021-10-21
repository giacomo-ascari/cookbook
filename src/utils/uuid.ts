function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateChar(top = 15) {
    let val = getRandomInt(0, top);
    let prefix: number;
    if (val < 10) prefix = 48;
    else  prefix = 97 - 10;
    return String.fromCharCode(val + prefix);
}

export default (short = false) => {
    let s = "";
    if (short) {
        for (let i = 0; i < 9; i++) s += generateChar(35);
    } else {
        for (let i = 0; i < 8; i++) s += generateChar();
        s += "-";
        for (let i = 0; i < 4; i++) s += generateChar();
        s += "-";
        for (let i = 0; i < 4; i++) s += generateChar();
        s += "-";
        for (let i = 0; i < 4; i++) s += generateChar();
        s += "-";
        for (let i = 0; i < 12; i++) s += generateChar();
    }
    return s;
}