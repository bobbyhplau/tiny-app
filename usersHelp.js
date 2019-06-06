let isEmailInUsers = function(email, obj) {

    for (let i in obj) {

        if (obj[i].email === email) {
            return true;
        }
    }

    return false;
}

module.exports.isEmailInUsers = isEmailInUsers;