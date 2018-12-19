var express = require("express");
var cookieParser = require('cookie-Parser');
var cookieSession = require('cookie-session')
var app = express();
var PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());

app.use(cookieSession( {name: 'session',
  keys: ['key1', 'key2']}));

const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": { userID: "Dan",
              shortURL: "b2xVn2",
              longURL:  "http://www.lighthouselabs.ca"},
  "9sm5xK": { userID: "Dan",
              shortURL: "9sm5xK",
              longURL: "http://www.google.com"},
};


const users = {};
const nameList = {};

app.get("/", (req, res) => {
  const templateVars = {user: req.cookies.user_id};
  res.render("./partials/_header", templateVars);
});

app.get("/login", (req,res) => {
  res.render("urls_login");
})

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const theUser = authenticateUser(email);

  if (theUser) {
    if (email == theUser.email && bcrypt.compareSync(password, theUser.hashedPassword)){
      req.session.user_id = theUser.user_id;
      res.redirect("/urls");
    }
    else {
      res.send("Error 403 - wrong password");
    }
  }
  else {
    res.send("Error 403 - email not found");
  }
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
})

app.post("/register", (req, res) => {
    const { name, email, password} = req.body;
      let randomID = generateRandomString();
      req.session.user_id = randomID;
    if (!email.length || !password.length || !name.length ) {
      res.send("Error 400");
    }
    else {
      for (let u in users) {
        if (email === users[u].email){
          res.send("Error 400");
        }
      }
      const thePassword = req.body.password; // you will probably this from req.params
      const hashedPassword = bcrypt.hashSync(thePassword, 10);
      const userID = registerUser(randomID, email, hashedPassword);
      nameList[randomID] = req.body.name;
      res.redirect("/urls",);
    }
})

function urlsForUser (id){
  let userUrlDb = {};
  for (let u in urlDatabase) {
    if (id == urlDatabase[u].userID) {
      userUrlDb[u] = urlDatabase[u];
    }
  }
  return userUrlDb;
}

function generateRandomString() {
  const randomKey = "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0pQAZWSXEDCRFVTGBYHNUJMIKOLP";
  let ans = "";
  while (ans.length < 6){
    var tempNum = Math.floor(Math.random() * (randomKey.length));
    ans+= randomKey[tempNum];
  }
  return ans;
}

function authenticateUser (userMail) {
  for (let u in users) {
    if (userMail === users[u].email){
      return users[u];
    }
  }
  return false;
}

function registerUser (randomID, email, password) {
  users[randomID] = {user_id: randomID, email: email, hashedPassword: password};
  return randomID;

}

app.get("/urls", (req, res) => {
  const urlsUserDb = urlsForUser(req.session.user_id);
  const templateVars = { name: nameList[req.session.user_id],
                       urls: urlsUserDb,
                       user: req.session.user_id};
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    const templateVars = { user: req.session.user_id};
    res.render("urls_new",templateVars);
  }
  else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id){
    res.redirect('/urls/' + req.param.id);
  }
  const templateVars = { name: nameList[req.session.user_id],
                       shortURL: req.params.id,
                       urls: urlDatabase,
                       user: req.session.user_id};
  res.render("urls_show", templateVars);
})

app.post("/urls/:id", (req, res) => {
  if ((req.body.longURL).includes('http://')){
    urlDatabase[req.params.id]["longURL"] = `${req.body.longURL}`;
  }
  else{
    urlDatabase[req.params.id]["longURL"] = `http://${req.body.longURL}`;
  }
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  let shortURL;
  shortURL = generateRandomString();
  let theLongURL;
  if ((req.body.longURL).includes('http://')){
    theLongURL = req.body.longURL;
  }
  else{
    theLongURL = `http://${req.body.longURL}`;
  }
  urlDatabase[shortURL] = {"userID": req.session.user_id};
  urlDatabase[shortURL].shortURL = shortURL;
  urlDatabase[shortURL].longURL = theLongURL;
  res.redirect('/urls/' + shortURL);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
})

app.post("/urls/:id/delete", (req, res) => {

  const deletURL = req.params.id;
  delete urlDatabase[deletURL];
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.session = null;
  res.redirect('/');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});