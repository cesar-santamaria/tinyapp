const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const { v4: uuidv4 } = require('uuid'); //NPM package that provides a unique identifier

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.use(morgan('dev'))


const PORT = 8080; // setting default port to 8080

app.set("view engine", "ejs"); // Tells the Express app to use EJS as its templating engine

// MOCK DATA
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com" 
};

const users = {
  "clarkKentID": {
    id: "clarkKentID",
    email: "superman@example.com",
    password: "smallville"
  },
  "loisLaneID": {
    id: "loisLaneID",
    email: "lois@example.com",
    password: "dailyplanet"
  }
};

//Function to generate a "unique" 6 character alphanumeric shortURL
function generateRandomString() {
  return Math.random().toString(20).substring(2, 8)
}

//----GET----
//Routes that render ejs templates
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
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
  const userId = req.cookies['user_id']
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[userId] };
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

app.get("/login", (req, res) => {
  const userId = req.cookies['userId'];
  const templateVars = { user:users[req.cookies.user_id] }
  res.render('urls_login', templateVars)
});

//----POST----
// creates new shortURL and stores it in users database.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  console.log('stores:', shortURL)
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// deletes existing entire longURL/shortURL entry from users database.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
});

// replaces/updates existing longURL in users database with new longURL from user input. 
app.post("/urls/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");
});

// logs in user if an email matches already existing email in users database.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    return res.status(400).send("Please enter a valid email and password");
  }

  let foundUser = null;
  for (const user in users){
    if (email === users[user].email) {
      foundUser = user;
    }
  } 
  res.cookie('user_id',foundUser)
  res.redirect("/urls")
})

// registers a user if email isnt already in use.
app.post("/register", (req, res) => {
  const id = uuidv4(); //assign unique identifier with the help of NPM package UUID
  const email = req.body.email;
  const password = req.body.password;
  
  // Error condition: if string or password are left empty return error msg.
  if (email === '' || password === '') {
    res.status(400).send("Please enter a valid email and password");
    res.end()
  }

  // Error condtion: if email address already exists return error msg.
  let foundUser = null;
  for (const user in users) {
    if (users[user].email === email) {
      foundUser = user;
      return res.status(400).send("Email address already exists")
    } 
  }

  const user = {
    id,
    email,
    password
  };
  
  users[id] = user
  
  res.cookie('user_id',id)
  res.redirect('/urls')
});

// logs out user by clearing cookie when logout button is clicked.
app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/login")
  res.end()
})

//----SERVER-----
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});