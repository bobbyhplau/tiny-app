var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function() {

    // base 36 is all arabic numerals and all latin alphabets

    return Math.random().toString(36)
}

app.set('view engine', 'ejs');

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

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
    let templateVars = { greeting: 'Hello World!' };
    res.render("hello_world", templateVars);
});

app.get('/urls', (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    res.render('urls_new');
});

app.get('/urls/:shortURL', (req, res) => {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
    console.log(req.body);
    res.send("Ok");
});