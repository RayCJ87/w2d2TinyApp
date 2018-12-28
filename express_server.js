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
const mailList = {};



app.get("/", (req, res) => {
  const templateVars = {user: req.cookies.theUserId, mail: mailList[req.cookies.theUserId] };
  res.render("./partials/_header", templateVars);
});

app.get("/login", (req,res) => {
  res.render("urls_login");
})

// User input personal information. Errors will be handled by the server
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const theUser = authenticateUser(email);

  if (theUser) {
    if (email === theUser.email && bcrypt.compareSync(password, theUser.hashedPassword)){
      req.session.theUserId = theUser.theUserId;
      req.session.theUserEmail = email;
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

// direct to the registration page
app.get("/register", (req, res) => {
  res.render("urls_registration");
})

// User input personal information to register, errors will be handled from server side
app.post("/register", (req, res) => {
    const { name, email, password} = req.body;
      let randomID = generateRandomString();
      req.session.theUserId = randomID;
    if (!email.length || !password.length || !name.length ) {
      res.send("Error 400");
    }
    else {
      for (let userID in users) {
        if (email === users[userID].email){
          res.send("Error 400");
        }
      }
      const thePassword = req.body.password; // you will probably this from req.params
      const hashedPassword = bcrypt.hashSync(thePassword, 10);
      registerUser(randomID, email, hashedPassword);
      nameList[randomID] = req.body.name;
      mailList[randomID] = req.body.email;
      res.redirect("/urls",);
    }
})

// helper funciton for setting urls for users
function urlsForUser (id){
  const userUrlDb = {};
  for (let user in urlDatabase) {
    if (id === urlDatabase[user].userID) {
      userUrlDb[user] = urlDatabase[user];
    }
  }
  return userUrlDb;
}

// generate random keys as short url and random id
function generateRandomString() {
  const randomKey = "1qaz2wsx3edc4rfv5tgb6yhn7ujm8ik9ol0pQAZWSXEDCRFVTGBYHNUJMIKOLP";
  let output = "";
  while (output.length < 6){

    let temporaryNumber = Math.floor(Math.random() * (randomKey.length));
    output+= randomKey[temporaryNumber];
  }
  return output;
}

//verify user information
function authenticateUser (userMail) {
  for (let userID in users) {
    if (userMail === users[userID].email){
      return users[userID];
    }
  }
  return false;
}

// store user information
function registerUser (randomID, email, password) {

  users[randomID] = {theUserId: randomID, email: email, hashedPassword: password};
  return randomID;

}

app.get("/urls", (req, res) => {
  const urlsUserDb = urlsForUser(req.session.theUserId);
  const templateVars = { name: nameList[req.session.theUserId],
                       mail: mailList[req.session.theUserId],
                       urls: urlsUserDb,
                       user: req.session.theUserId};
  res.render("urls_index", templateVars);

});

//direct to the webpage for generating new short url
app.get("/urls/new", (req, res) => {
  if (req.session.theUserId){
    const templateVars = { user: req.session.theUserId, mail: mailList[req.session.theUserId]};
    res.render("urls_new",templateVars);
  }
  else {
    res.redirect("/login");
  }
});

//direct to page where user can update/edit short urls
app.get("/urls/:id", (req, res) => {
  if (!req.session.theUserId){
    res.redirect('/urls/' + req.param.id);
  }
  const templateVars = { name: nameList[req.session.theUserId],
                       mail: mailList[req.session.theUserId],
                       shortURL: req.params.id,
                       urls: urlDatabase,
                       user: req.session.theUserId};
  res.render("urls_show", templateVars);
})


//update short urls
app.post("/urls/:id", (req, res) => {
  if ((req.body.longURL).includes('http://')){
    urlDatabase[req.params.id]["longURL"] = `${req.body.longURL}`;
  } else if ((req.body.longURL).includes('https://')){
    urlDatabase[req.params.id]["longURL"] = `${req.body.longURL}`;
  }
  else {
    urlDatabase[req.params.id]["longURL"] = `http://${req.body.longURL}`;
  }
  res.redirect("/urls");
})

//direct to /urls with new short urls shown
app.post("/urls", (req, res) => {
  let shortURL;
  shortURL = generateRandomString();
  let theLongURL;
  if ((req.body.longURL).includes('http://') || (req.body.longURL).includes('https://')){
    theLongURL = req.body.longURL;
  }
  // else if ((req.body.longURL).includes('https://')){
  //   theLongURL = req.body.longURL;
  // }
  else{
    theLongURL = `http://${req.body.longURL}`;
  }
  urlDatabase[shortURL] = {"userID": req.session.theUserId};
  urlDatabase[shortURL].shortURL = shortURL;
  urlDatabase[shortURL].longURL = theLongURL;
  res.redirect('/urls/' + shortURL);
});

//redirect to the exact "website" related to the short url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
})

// delete the urls on the urls page
app.post("/urls/:id/delete", (req, res) => {
  const deletURL = req.params.id;
  delete urlDatabase[deletURL];
  res.redirect('/urls');
})

//logout and redirect to the front page
app.post("/logout", (req, res) => {
  res.session = null;
  res.redirect('/');
})

app.listen(PORT, () => {
});