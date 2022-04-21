const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid'); //NPM package that provides a unique identifier

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

const users = {
  'spiderman': {
    id: uuidv4(),
    email:"spiderman@gmail.com",
    password:"spideysense"
  }
};

// ROUTES
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  console.log(users[req.cookies.user_id])
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {urls: urlDatabase, user: users[req.cookies.user_id] }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id] }
  res.render("urls_register", templateVars)
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
  res.redirect("/urls")
})

//USER REGISTER
app.post("/register", (req, res) => {
  const id = uuidv4();
  const email = req.body.email;
  const password = req.body.password;
  const user = {
    id,
    email,
    password
  };

  users[id] = user

  res.cookie('user_id',id)
  res.send("Got your info")
});

//USER LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
})

//SERVER LISTENING ON PORT: 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//simulate generating a "unique" shortURL that returns a string of 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(20).substring(2, 8)
}

/* 
Update all endpoints that currently pass a username value to the templates to pass the entire user object to the template instead:
*/