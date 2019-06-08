const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const expiryDate = new Date(Date.now() + 60 * 60 * 1000 * 72) // 72 hour

const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ["The documentation said that I needed a secret, so the only thing I could come up with is that my guilty pleasure is to listen to korean pop music from the girl band TWICE!"],
    cookie: {
        secure: true,
        httpOnly: true,
        domain: 'localhost:8080',
        path: '/',
        expires: expiryDate
    }
}));

const isEmailInUsers = require('./usersHelp').isEmailInUsers;
const urlsForUser = require('./usersHelp').urlsForUser;
const countUnique = require('./urlHelp').countUnique;
const isShortURLInURL = require('./urlHelp').isShortURLInURL;

const bcrypt = require('bcrypt');
const salt = 'ppd';

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const generateRandomString = function() {

    let charSet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let randomNum = () =>
        Math.floor(Math.random() * charSet.length);

    let randomStr = ""

    for (let i = 0; i < 6; i++) {
        randomStr += charSet.charAt(randomNum());
    }

    return randomStr;
}

app.set('view engine', 'ejs');

const sampleDate = new Date('December 31, 1999 11:59:59');

const urlDatabase = {
    test01: { longURL: "https://www.tsn.ca", userID: "myTestID2", visits: [] },
    test02: { longURL: "https://www.google.ca", userID: "myTestID", visits: [{ date: sampleDate, id: 'visiID' }] },
    test03: { longURL: "https://www.reddit.com", userID: "myTestID", visits: [] }
};

const users = {
    "myTestID": {
        id: "myTestID",
        email: "asdf@email.com",
        password: bcrypt.hashSync("asdf" + salt, 10)
    },
    "myTestID2": {
        id: "myTestID2",
        email: "asdf1@email.com",
        password: bcrypt.hashSync("asdf1" + salt, 10)
    }
}

app.get("/", (req, res) => {
    res.redirect('/urls');
});

app.listen(PORT, () => {
    console.log(`TinyApp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get('/urls', (req, res) => {

    let tempID = req.session['user_id'];

    let templateVars = {
        urls: urlsForUser(urlDatabase, tempID),
        user: users[tempID]
    };
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {

    let templateVars = {
        user: users[req.session['user_id']]
    };

    if (templateVars.user) {
        res.render('urls_new', templateVars);
    } else {
        res.render('login_index', templateVars);
    }
});

app.get('/urls/:shortURL', (req, res) => {

    let tempUser = users[req.session['user_id']];
    let templateVars = { user: tempUser };
    let tempShortURL = req.params.shortURL;

    if (!(isShortURLInURL(urlDatabase, tempShortURL))) {

        templateVars.code = 404;
        templateVars.message = "Not found.";
        return res.status(404).render('error_index', templateVars);
    }

    let tempLongURL = urlDatabase[tempShortURL].longURL;
    let uniqueVisits = countUnique(urlDatabase[tempShortURL].visits);

    if (!(tempUser)) {
        return res.status(403).redirect('/login');
    } else {
        if (tempUser.id === urlDatabase[tempShortURL].userID) {
            templateVars.shortURL = tempShortURL;
            templateVars.longURL = tempLongURL;
            templateVars.visits = urlDatabase[tempShortURL].visits;
            templateVars.unique = uniqueVisits;

            return res.render('urls_show', templateVars);
        } else {
            templateVars.code = 403;
            templateVars.message = "This isn't your ShortURL!"
            return res.status(403).render('error_index', templateVars);
        }
    }
});

app.post('/urls', (req, res) => {

    if (!(req.session.user_id)) {
        return res.status(403).send('You need to be logged in to add a new URL');
    }

    let randomString = generateRandomString();
    urlDatabase[randomString] = {
        longURL: req.body.longURL,
        userID: req.session.user_id,
        visits: []
    }
    urlDatabase[randomString].longURL = req.body.longURL;
    res.redirect(`/urls/${randomString}`);
});

app.get('/u/:shortURL', (req, res) => {

    let templateVars = { user: users[req.session.user_id] }
    let tempShortURL = req.params.shortURL;

    if (!(isShortURLInURL(urlDatabase, tempShortURL))) {

        templateVars.code = 404;
        templateVars.message = "Not found.";
        return res.status(404).render('error_index', templateVars);
    }

    let currentDate = Date(Date.now());

    if (!(req.session.visitor_id)) {
        req.session.visitor_id = generateRandomString();
    }

    let currentVisitor = req.session.visitor_id;
    let visit = { date: currentDate, id: currentVisitor };

    urlDatabase[tempShortURL].visits.push(visit);

    res.redirect(urlDatabase[tempShortURL].longURL);
});

app.get('/killVID', (req, res) => {
    req.session.visitor_id = null;
    res.redirect('/urls')
});

//should use delete
app.delete('/urls/:shortURL', (req, res) => {

    let tempShortURL = req.params.shortURL;
    let tempUserID = req.session.user_id;

    if (tempUserID !== urlDatabase[tempShortURL].userID) {
        return res.status(403).send('You\'re not authorized to delete this shortURL');
    }

    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

app.put('/urls/:shortURL', (req, res) => {

    let tempShortURL = req.params.shortURL;
    let tempUserID = req.session.user_id;

    if (tempUserID !== urlDatabase[tempShortURL].userID) {
        return res.status(403).send('You\'re not authorized to edit this shortURL');
    }

    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('back');
});

app.get('/login', (req, res) => {
    let templateVars = {
        user: users[req.session['user_id']],
        passMess: "",
        tempEmail: ""
    }
    req.session = null;
    res.render('login_index', templateVars);
});

app.get('/register', (req, res) => {
    let templateVars = {
        user: users[req.session.user_id],
        tempEmail: "",
        passMess: ""
    }
    req.session = null;
    res.render('register_index', templateVars);
});

app.post('/login', (req, res) => {

    let tempEmail = req.body.email;
    let tempPass = req.body.password;

    let checkUser = isEmailInUsers(users, tempEmail);
    let checkPass = checkUser.password;

    if ((!(checkUser)) || (!(bcrypt.compareSync(tempPass + salt, checkPass)))) {
        let templateVars = {
            user: users[req.session.user_id],
            passMess: "The login information you've submitted doesn't match what we have on our end.",
            tempEmail: tempEmail
        }
        return res.status(403).render('login_index', templateVars);
    }

    req.session.user_id = checkUser.id;
    res.redirect('/urls');
});

app.post('/register', (req, res) => {

    let tempID = generateRandomString();
    let tempEmail = req.body.email;
    let tempPass = req.body.password;

    if (tempEmail === "" || tempPass === "") {
        let templateVars = {
            user: users[req.session.user_id],
            passMess: "E-mail and Password cannot be left blank.",
            tempEmail: tempEmail
        }
        return res.status(403).render('register_index', templateVars);
    }

    if (isEmailInUsers(users, tempEmail)) {
        let templateVars = {
            user: users[req.session.user_id],
            passMess: "Your e-mail is already registered with us!",
            tempEmail: tempEmail
        }
        return res.status(403).render('register_index', templateVars);
    }

    const hashedPassword = bcrypt.hashSync(tempPass + salt, 10);

    users[tempID] = { 'id': tempID, email: tempEmail, password: hashedPassword };
    req.session.user_id = tempID;
    res.redirect('/urls');
});