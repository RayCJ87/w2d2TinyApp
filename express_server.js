var express = require("express");
var cookieParser = require('cookie-Parser');
var app = express();
var PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var shortURL = "";

app.get("/", (req, res) => {
  // res.send("Hello!");
  // res.cooki
    let templateVars = {username: req.cookies["username"]};
  res.render("./partials/_header", templateVars);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase,
                      username: req.cookies["username"] };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        urls: urlDatabase,
                        username: req.cookies["username"]};
  res.render("urls_show", templateVars);
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = `http://${req.body.longURL}`;
  res.redirect("/urls");

})

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  let theLongURL = `http://${req.body.longURL}`;
  urlDatabase[req.params.id] = theLongURL;
  res.redirect('/urls/' + shortURL);

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  console.log("signed in!");
  console.log(req.body.username);;

  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  console.log(req.cookie);
  res.redirect('/urls');
})

app.post("/urls/:id/delete", (req, res) => {

  let deletURL = req.params.id;
  console.log(deletURL);
  delete urlDatabase[deletURL];
  console.log(urlDatabase);
  res.redirect('/urls');
})

function generateRandomString() {
  var randomKey = "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0pQAZWSXEDCRFVTGBYHNUJMIKOLP";
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