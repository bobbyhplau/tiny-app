let isEmailInUsers = function(obj, em) {

    for (let i in obj) {

        if (obj[i].email === em) {
            return obj[i];
        }
    }

    return false;
}

let urlsForUser = function(obj, id) {

    let newObj = {};

    for (let i in obj) {

        if (obj[i].userID === id) {
            newObj[i] = obj[i];
        }
    }

    return newObj;
}

module.exports.isEmailInUsers = isEmailInUsers;
module.exports.urlsForUser = urlsForUser;