const express = require('express');
const { generateRandomString } = require('./support')
const cookieParser = require('cookie-parser');
const PORT = 8080;
const app = express();

//adding app.use(cookieParser()) before any routes that use cookies, 
app.use(cookieParser());
//to analyze incoming HTTP requests with URL-encoding(middleware)
app.use(express.urlencoded({ extended: true }));
// set the view engine to ejs
app.set('view engine', 'ejs');

//short URLs and their corresponding long URLs
const urlDatabase = {};
//to store all users
const users = {};

// Home page.
// app.get('/', (req, res) => {
//   const userID = req.cookies.user_id;
//   if (!idUser) return res.render('urls_index', { userObject: null });

//   const userObject = Object.values(users).find((user) => user.id === userID);
//   res.render("urls_index", { urls: urlDatabase, userObject });
// });


app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render('urls_index', templateVars);
});

//route to show a form for creating a new short URL
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

//show details  for short URL
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render('urls_show', templateVars);
});

// create a new short URL and add it to the database
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  // Check if longURL already exists in urlDatabase
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
  longURL ? res.redirect(longURL)
    : res.status(404).send("Short URL not found");
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

  // Check if newLongURL is empty
  if (!newLongURL) {
    return res.status(400).send('No input');
  }

  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

//register with an email address and password field
app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render('registrPage', templateVars);
});

// registration route handler
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  // Check if email or password are empty
  if (!email || !password) {
    return res.status(400).send('Please provide an email and password');
  }

  // Check if email already exists in users object
  const existingUser = Object.values(users).find(user => user.email === email);
  if (existingUser) {
    return res.status(400).send('Email already exists');
  }

  // If email does not already exist, generate a new user id and add new user to users object
  const id = generateRandomString();
  users[id] = { id, email, password };
  // set user_id cookie
  res.cookie('user_id', id);
  res.redirect('/urls');
});

//The Login Route
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});



//logout rout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});