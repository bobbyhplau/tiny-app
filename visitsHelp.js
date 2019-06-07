const countUnique = function(arr) {

    let countObj = {};

    for (let i of arr) {
        countObj[i.id] = 0;
    }

    let keys = Object.keys(countObj);

    return keys.length;
}

module.exports.countUnique = countUnique;