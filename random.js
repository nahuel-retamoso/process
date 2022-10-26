function randomNumbers(n) {
    if (n === undefined) {
        n = 100000000;
    }
    let arr = [];
    for (let i = 0; i < n; i++) {
        arr.push(Math.floor(Math.random() * 1000) + 1);
    }
    const obj = countNumbers(arr);
    return obj;
}

function countNumbers(arr) {
    let obj = {};
    arr.forEach((num) => {
        if (obj[num] === undefined) {
            obj[num] = 1;
        } else {
            obj[num]++;
        }
    });
    return obj;
}