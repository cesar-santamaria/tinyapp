const existingUserEmail = function(email, users) {
  for (const user in users) {
    console.log('USERS',users)
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

const generateRandomString = function() { //generates "unique" random alphanumeric characters
  return Math.random().toString(20).substring(2, 8)
};

const getUserURLs = function(id, urlDatabase) { // returns URLs for for a logged in user
  let savedUserURLs = {};
  const user = id;
  for (const key in urlDatabase) {
    if (user.id === urlDatabase[key].userID) {
      savedUserURLs[key] = urlDatabase[key];
    }
  }
  return savedUserURLs;
};

module.exports = { generateRandomString, existingUserEmail, getUserURLs }