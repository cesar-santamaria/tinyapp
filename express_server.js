const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); // This tells the Express app to use EJS as its templating engine

// Mock Data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com" 
};

// Routes
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//CREATE
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});



//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});

//UPDATE
app.post("/urls/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");
});

//USER LOGIN
app.post("/login", (req, res) => {
  console.log('req.body.username:',req.body.username);
  const username = res.cookie('username', req.body.username);

  res.redirect("/urls")
})

//Event listener on Port: 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//simulate generating a "unique" shortURL that returns a string of 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(20).slice(2, 8)
}
