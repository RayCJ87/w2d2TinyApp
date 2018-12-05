var express = require("express");
var app = express();
var PORT = 8080;

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var shortURL = "";

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {res.json(urlDatabase);
});

// app.post("/urls/new", (req, res) => {
// Respond with 'Ok' (we will replace this)
// console.log(req.body);  // debug statement to see POST parameters
//   res.send("Ok");

// });

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        urls: urlDatabase };
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  let theLongURL = `http://${req.body.longURL}`;
  urlDatabase[shortURL] = theLongURL;
  console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

function generateRandomString() {
  var randomKey = "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0p";
  var ans = "";
  while (ans.length < 6){
      var tempNum = Math.floor(Math.random() * (randomKey.length ));
      ans += randomKey[tempNum];
  }
  return ans;

}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});