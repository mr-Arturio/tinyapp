const express = require('express');
const app = express();
const PORT = 8080;

//generate a random short URL ID
function generateRandomString() {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while (result.length < 6) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//to analyze incoming HTTP requests with URL-encoding(middleware)
app.use(express.urlencoded({ extended: true }));

// set the view engine to ejs
app.set('view engine', 'ejs');

//short URLs and their corresponding long URLs
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//route to handle the root URL
app.get('/', (req, res) => {
  res.send('Hello!');
});

//route to show a list of short URLs
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//route to show a form for creating a new short URL
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

//show details  for short URL
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

app.post('/urls', (req, res) => {
  // Generate a random short URL ID
  const shortURL = generateRandomString();
  // Add the new key-value pair to the urlDatabase object
  urlDatabase[shortURL] = req.body.longURL;
  // Redirect to the page that shows the new short URL
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});