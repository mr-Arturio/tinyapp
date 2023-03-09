const express = require('express');
const {
  generateRandomString,
  getUserByEmail,
} = require('./helper');
const cookieParser = require('cookie-parser');
const PORT = 8080;
const app = express();

//adding app.use(cookieParser()) before any routes that use cookies
app.use(cookieParser());
//to analyze incoming HTTP requests with URL-encoding(middleware)
app.use(express.urlencoded({ extended: true }));
// set the view engine to ejs
app.set('view engine', 'ejs');

//short URLs and their corresponding long URLs
const urlDatabase = {};
//to store all users
const users = {};

app.get('/urls', (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render('urls_index', templateVars);
});


//route to show a form for creating a new short URL
app.get('/urls/new', (req, res) => {
  const userId = req.cookies.user_id;
  //check whether the user is logged in
  if (!userId) {
    return res.redirect('/login');
  }
  const user = users[userId];
  const templateVars = {
    user: user
  };
  res.render('urls_new', templateVars);
});

// create a new short URL and add it to the database
app.post('/urls', (req, res) => {
  //check if used is not logged in
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.status(401).send('Error: You need to be logged in to shorten URLs');
  }
  // Check if longURL already exists in urlDatabase
  const longURL = req.body.longURL;
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL] === longURL) {
      //show an error message if exist
      res.status(400).send('URL already in use');
      return;
    }
  }
  // If longURL does not already exist, generate a new shortURL and add it to urlDatabase
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// route handler to redirect shortURL to its longURL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  //error message when a user requests a non-existent URL
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send('Error: Short URL not found');
  }
});

//route that removes a URL resource
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//route that updates a URL resource
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

//register with an email address and password field
app.get('/register', (req, res) => {
  const { user_id } = req.cookies;
  const user = users[user_id];
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

  // Check if email already exists in users object
  const existingUser = getUserByEmail(users, email);

  if (existingUser) {
    return res.status(400).send('This email is already registered, please use a different email');
  }

  // If email does not already exist, generate a new user id and add new user to users object
  const id = generateRandomString();
  users[id] = { id, email, password };
  // set user_id cookie
  res.cookie('user_id', id);
  res.redirect('/urls');
});

//route to render the login page with email and password fields.
app.get('/login', (req, res) => {
  const { user_id } = req.cookies;
  const user = users[user_id];
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
  const userId = req.cookies.user_id;

  // Check if email already exists in users object
  const user = getUserByEmail(users, email);

  if (!user || user.password !== password) {
    return res.status(403).send('Invalid email or password');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

//logout rout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});