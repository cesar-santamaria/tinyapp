const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const morgan = require('morgan')
const { v4: uuidv4 } = require('uuid'); //NPM package that provides a unique identifier
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'))
app.use(cookieSession({
  name: 'session',
  keys: ['my','secret','keys']
}))

const PORT = 8080; // setting default port to 8080

app.set("view engine", "ejs"); // Tells the Express app to use EJS as its templating engine

// MOCK DATA
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "ckentID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "llaneID" }
};

const users = {};

// ----HELPER FUNCTIONS----
const getUserURLs = (req) => {
  let savedUserURLs = {};
  const user = users[req.session.user_id];

  for (const key in urlDatabase) {
    if (user.id === urlDatabase[key].userID) {
      savedUserURLs[key] = urlDatabase[key];
    }
  }
  return savedUserURLs;
}


//Function to generate a "unique" 6 character alphanumeric shortURL
const generateRandomString = () => {
  return Math.random().toString(20).substring(2, 8)
};

//Helper Function
const existingUserEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      console.log(user)
      return users[user];
    }
  }
  return null;
};

//----GET----
//Routes that render ejs templates
app.get("/", (req, res) => {
  const user = users[req.session.user_id]

  if (!user) {
    return res.status(401).redirect("/login")
  }
  const templateVars = {user: user};
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  let savedUserURLs = getUserURLs(req);
  const user = users[req.session.user_id];
  console.log('user.id',user.id)
  const templateVars = {urls: savedUserURLs, user: user};
  
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const savedUserURLs = getUserURLs(req);
  const user = users[req.session.user_id]
  
  const templateVars = {urls: savedUserURLs, user: user }
  
  if (!user) {
    return res.status(401).redirect('/login')
  }

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, url: urlDatabase[req.params.shortURL], user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  console.log(req.params.shortURL)
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] }
  res.render("urls_register", templateVars)
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id]
  const templateVars = { user: user }

  if (user) {
    return res.redirect("/urls");
  }
  res.render('urls_login', templateVars)
});

//----POST----
// creates new shortURL and stores it in users database.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const user = users[req.session.user_id];

  if (!user) {
    return res.status(401).send('Unauthorized')
  }

  // urlDatabase[shortURL] = req.body.longURL
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id }
  res.redirect(`/urls/${shortURL}`);
});

// deletes existing entire longURL/shortURL entry from users database.
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;

  if (!userId) {
    return res.send('Permission denied, must be owner of account to delete url link')
  }

  delete urlDatabase[shortURL]
  res.redirect("/urls")
});

// replaces/updates existing longURL in users database with new longURL from user input. 
app.post("/urls/:shortURL",(req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  
  if (!userId) {
    return res.send('Permission denied, must be owner of account to edit url link')
  }
  
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// logs in user if an email matches already existing email in users database.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = existingUserEmail(email, users);
  
  
  if (!email|| !password) {
    return res.status(400).send("Please enter a valid email and password");
  }
  
  if (!foundUser) {
    res.send("No account found with this email address, please register");
  }
  
  //password authentification
  const result = bcrypt.compareSync(password, foundUser.password); 
  if (!result) {
    return res.status(403).send("Email or password does not match")
  }

  req.session.user_id = foundUser.id;
  res.redirect("/urls")
})

// registers a user if email isnt already in use.
app.post("/register", (req, res) => {
  const id = uuidv4();
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = existingUserEmail(email, users)
  
  // Error condition: if string or password are left empty return error msg.
  if (!email|| !password) {
    res.status(400).send("Please enter a valid email and password");
    res.end()
  }
  
  // Error condtion: if email address already exists return error msg.
  if (foundUser) {
    res.send("This email address is already taken, please try again")
  }
  
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(password, salt);

  const user = {
    id,
    email,
    password: hashedPassword
  };
  
  users[id] = user
  console.log(user)
  req.session.user_id = id;
  res.redirect('/urls')
});

// logs out user by clearing cookie when logout button is clicked.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login")
})

//----SERVER-----
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});