//generate a random short URL ID
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (result.length < 6) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//returns the URLs where the userID is equal to the id of the currently logged-in user
function urlsForUser(id, urlDatabase) {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return urls;
}

// check for existing short URLs in the database for new users.
function getUserUrls(userId, database) {
  return Object.values(database).filter(url => url.userID === userId);
}

// Check if email already exists in users object
function getUserByEmail(users, email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

module.exports = { 
  generateRandomString, 
  getUserByEmail, 
  urlsForUser,
  getUserUrls
};