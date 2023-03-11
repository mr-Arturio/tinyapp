const express = require('express');
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  getUserUrls
} = require('./helper');
const cookieSession = require('cookie-session');
const PORT = 8080;
const app = express();

//  middleware cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
//to analyze incoming HTTP requests with URL-encoding(middleware)
app.use(express.urlencoded({ extended: true }));
// set the view engine to ejs
app.set('view engine', 'ejs');

//short URLs and their corresponding long URLs
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};
//to store all users
const users = {};


app.get('/', (req, res) => {
  res.redirect('/urls');
});

//register with an email address and password field
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  // check if the user is already logged in
  if (user) {
    res.redirect('/urls'); // redirect to /urls if user is logged in
  } else {
    res.render('registrPage', templateVars); // render login page if user is not logged in
  }
});

// registration route handler
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  // Check if email or password are empty
  if (!email || !password) {
    return res.status(400).send('Email and password fields are required');
  }

  // Check if email already exists in users object
  const existingUser = getUserByEmail(users, email);

  if (existingUser) {
    return res.status(400).send('This email is already registered, please use a different email');
  }

  // If email does not already exist, generate a new user id and add new user to users object
  const id = generateRandomString();
  users[id] = { id, email, hashedPassword };
  // set user_id cookie
  req.session.user_id = id;
  res.redirect('/urls');
});

//route to render the login page with email and password fields.
app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  // check if the user is already logged in
  if (user) {
    res.redirect('/urls'); // redirect to /urls if user is logged in
  } else {
    res.render('login', templateVars); // render login page if user is not logged in
  }
});

//The Login Route
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //const userId = req.cookies.user_id;

  // Check if email already exists in users object
  const user = getUserByEmail(users, email);

  if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
    return res.status(403).send('Invalid email or password');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

//logout rout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

//route handler to filter the URLs for the logged-in user
app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  const userUrls = urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user: user
  };
  res.render('urls_index', templateVars);
});


//route to show a form for creating a new short URL
app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  //check whether the user is logged in
  if (!user) {
    return res.redirect('/login');
  }

  const templateVars = {
    user: user
  };
  res.render('urls_new', templateVars);
});

//show details  for short URL
app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const id = req.params.id;
  const url = urlDatabase[id];

  //error message to the user if they are not logged in.
  if (!user) {
    return res.status(401).send('Please log in to view this URL');
  }

  //error message to the user if they do not own the URL.
  if (url.userID !== req.session.user_id) {
    res.status(403).send('You do not have permission to view this URL');
    return;
  }

  const templateVars = {
    id: id,
    longURL: url.longURL,
    user: user
  };
  res.render('urls_show', templateVars);
});

// create a new short URL and add it to the database
app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  //check if user is not logged in
  if (!userId) {
    return res.status(401).send('Error: You need to be logged in to shorten URLs');
  }
  // Check if longURL already exists in urlDatabase
  const longURL = req.body.longURL;
  const userUrls = getUserUrls(userId, urlDatabase);
  if (userUrls.some(url => url.longURL === longURL)) {
    return res.status(400).send('Error: URL already in use');
  }
  // If longURL does not already exist, generate a new shortURL and add it to urlDatabase
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId
  };
  res.redirect(`/urls/${shortURL}`);
});

// route handler to redirect shortURL to its longURL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  //error message when a user requests a non-existent URL
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('Error: Short URL not found');
  }
});

//route that removes a URL resource
app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const url = urlDatabase[id];

  // error message to the user if they are not logged in
  if (!userId) {
    return res.status(401).send('Error: You need to be logged in to delete this URL');
  }

  // Error message to the user if the URL ID does not exist
  if (!url) {
    return res.status(404).send('Error: URL not found');
  }

  // error message to the user if they do not own the URL
  if (url.userID !== userId) {
    res.status(403).send('You do not have permission to delete this URL');
    return;
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

//route that updates a URL resource
app.post('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const id = req.params.id;
  const url = urlDatabase[id];
  const newLongURL = req.body.longURL;

  // error message if URL does not exist
  if (!url) {
    return res.status(404).send('Error: URL not found');
  }

  // error message if user is not logged in
  if (!user) {
    return res.status(401).send('Error: You need to be logged in to edit this URL');
  }

  // error message if user does not own the URL
  if (url.userID !== req.session.user_id) {
    return res.status(403).send('Error: You do not have permission to edit this URL');
  }

  url.longURL = newLongURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});