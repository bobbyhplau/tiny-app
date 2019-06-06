let isEmailInUsers = function(obj, em) {

    for (let i in obj) {

        if (obj[i].email === em) {
            return obj[i];
        }
    }

    return false;
}

module.exports.isEmailInUsers = isEmailInUsers;