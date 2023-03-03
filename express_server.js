const express = require('express');
const app = express();
const PORT = 8080;

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

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id, longURL: 'http://www.lighthouselabs.ca'};
  res.render('urls_show', templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});