//generate a random short URL ID
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (result.length < 6) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getUserByEmail(users, email){
  let existingUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      existingUser = user;
      break;
    }
  }
  return existingUser;
}

module.exports = { generateRandomString, getUserByEmail };