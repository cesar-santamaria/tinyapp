const express = require("express");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const PORT = 8080; // setting default port to 8080

app.set("view engine", "ejs"); // Tells the Express app to use EJS as its templating engine

// MOCK DATA
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com" 
};

// ROUTES
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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
  const username = res.cookie('username', req.body.username);
  res.redirect("/urls")
})

//USER LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('username',req.body.username)
  res.redirect("/urls")
})

//SERVER LISTENING ON PORT: 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//simulate generating a "unique" shortURL that returns a string of 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(20).slice(2, 8)
}
