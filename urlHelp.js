const countUnique = function(arr) {

    let countObj = {};

    for (let i of arr) {
        countObj[i.id] = 0;
    }

    let keys = Object.keys(countObj);

    return keys.length;
}

const isShortURLInURL = function(obj, short) {

    for (let i in obj) {

        if (i === short) {
            return obj[i];
        }
    }

    return false;
}

module.exports.countUnique = countUnique;
module.exports.isShortURLInURL = isShortURLInURL;