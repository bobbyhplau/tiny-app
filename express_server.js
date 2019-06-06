var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const isEmailInUsers = require('./usersHelp').isEmailInUsers;

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

const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "myTestID2" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "myTestID" },
    e33xs2: { longURL: "https://www.reddit.com", userID: "myTestID" }
};

const users = {
    "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
    },
    "myTestID": {
        id: "myTestID",
        email: "asdf@email.com",
        password: "asdf"
    },
    "myTestID2": {
        id: "myTestID2",
        email: "asdf@email.com",
        password: "asdf"
    }
}

app.get("/", (req, res) => {
    res.send("Hello!");
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    let templateVars = {
        greeting: 'Hello World!',
        user: users[req.cookies['user_id']]
    };
    res.render("hello_world", templateVars);
});

app.get('/urls', (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        user: users[req.cookies['user_id']]
    };
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {

    let templateVars = {
        user: users[req.cookies['user_id']]
    };

    if (templateVars.user) {
        res.render('urls_new', templateVars);
    } else {
        res.render('login_index', templateVars);
    }
});

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        user: users[req.cookies['user_id']]
    };
    res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {

    if (!(req.cookies.user_id)) {
        return res.status(403).send('You need to be logged in to add a new URL');
    }

    let randomString = generateRandomString();
    urlDatabase[randomString].longURL = req.body.longURL;
    res.redirect(`/urls/${randomString}`);
});

app.get('/u/:shortURL', (req, res) => {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/logout', (req, res) => {
    res.clearCookie('user_id')
        .redirect('back');
});

app.get('/login', (req, res) => {
    let templateVars = {
        user: users[req.cookies['user_id']]
    }
    res.clearCookie('user_id').render('login_index', templateVars);
});

app.get('/register', (req, res) => {
    let templateVars = {
        user: users[req.cookies['user_id']]
    }
    res.clearCookie('user_id').render('register_index', templateVars);
});

app.post('/login', (req, res) => {

    let tempEmail = req.body.email;
    let tempPass = req.body.password;

    let checkUser = isEmailInUsers(users, tempEmail);
    let checkPass = checkUser.password;

    if (!(checkUser)) {
        return res.status(403).send('Email not found');
    }

    if (tempPass !== checkPass) {
        return res.status(403).send('Password incorrect');
    }

    res.cookie('user_id', checkUser.id).redirect('/urls');
});

app.post('/register', (req, res) => {

    let tempID = generateRandomString();
    let tempEmail = req.body.email;
    let tempPass = req.body.password;

    if (tempEmail === "" || tempPass === "") {
        return res.status(403).send('E-mail and Password cannot be left blank');
    }

    if (isEmailInUsers(users, tempEmail)) {
        return res.status(403).send('Your e-mail is already registered with us!');
    }

    users[tempID] = { 'id': tempID, email: tempEmail, password: tempPass };
    res.cookie('user_id', tempID).redirect('/urls');
});