const { assert } = require('chai');

const { existingUserEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('existingUserEmail', function() {
  it('should return a user with valid email', function() {
    const user = existingUserEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });
  it('should return a undefined with invalid email', function() {
    const user = existingUserEmail(testUsers, "DShrute@example.com");
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});