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

//to analyze incoming HTTP requests with URL-encoding
app.use(express.urlencoded({ extended: true }));

// set the view engine to ejs
app.set("view engine", "ejs");

//short URLs and their corresponding long URLs
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

//GET Route to Show the Form
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id, longURL: 'http://www.lighthouselabs.ca'};
  res.render('urls_show', templateVars);
});

//POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});