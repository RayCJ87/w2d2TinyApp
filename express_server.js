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

var urlDatabase = {
  "b2xVn2": { userID: "Dan",
              shortURL: "b2xVn2",
              longURL:  "http://www.lighthouselabs.ca"},
  "9sm5xK": { userID: "Dan",
              shortURL: "9sm5xK",
              longURL: "http://www.google.com"},
};

var shortURL = "";
const users = {};
const nameList = [];

app.get("/", (req, res) => {
  let templateVars = {user: req.cookies.user_id};
  res.render("./partials/_header", templateVars);
});

app.get("/login", (req,res) => {
  res.render("urls_login");
})


app.post("/login", (req, res) => {

  //loop through users to find req.body.*
  let email = req.body.email;
  let password = req.body.password;
  const theUser = authenticateUser(email);
  // console.log("the User: ", theUser);

  if (theUser) {
    if (email == theUser.email && bcrypt.compareSync(password, theUser.hashedPassword)){
      req.session.user_id = theUser.user_id;
      console.log(req.session.user_id);
      console.log("login success!");
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
    const { email, password} = req.body;
      let randomID = generateRandomString();
      req.session.user_id = randomID;
    if (email.length === 0 || password.length === 0) {
      res.send("Error 400");
    }
    else {
      for (let u in users) {
        if (email === users[u].email){
          res.send("Error 400");
        }
      }
      // res.cookie("user_id", randomID);

      console.log(users);
      // console.log("the user->:", users[userID].password);
      const thePassword = req.body.password; // you will probably this from req.params
      const hashedPassword = bcrypt.hashSync(thePassword, 10);
      const userID = registerUser(randomID, email, hashedPassword);
      nameList.push(req.body.name);
      res.redirect("/urls",);
    }
})


function authenticateUser (userMail) {
  for (var u in users) {
    if (userMail === users[u].email){
      return users[u];
    }
    // console.log(userMail);
  }
  return false;
}

function registerUser (randomID, email, password) {
  users[randomID] = {user_id: randomID, email: email, hashedPassword: password};
  console.log(users[randomID]);
  return randomID;

}


app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  const urlsUserDb = urlsForUser(req.session.user_id);
  console.log("check urls");
  console.log("Look here for user id: " );
  // cookie.log(req.session.user_id);
  console.log();
  let templateVars = {name: nameList,
                      urls: urlsUserDb,
                      user: req.session.user_id };
  res.render("urls_index", templateVars);

});

function urlsForUser (id){
  let userUrlDb = {};
  for (var u in urlDatabase) {
    if (id == urlDatabase[u].userID) {
      userUrlDb[u] = urlDatabase[u];
    }
  }
  return userUrlDb;
}

app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    // console.log("user id is : --> " + (req.session.user_id));
    let templateVars = { user: req.session.user_id};
    res.render("urls_new",templateVars);
  }
  else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id){
    // res.send("Please log in");
    res.redirect('/urls/' + req.param.id);
  }
  let templateVars = {  name: nameList,
                        shortURL: req.params.id,
                        urls: urlDatabase,
                        user: req.session.user_id};

  res.render("urls_show", templateVars);
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id]["longURL"] = `http://${req.body.longURL}`;
  res.redirect("/urls");

})

app.post("/urls", (req, res) => {
  shortURL = generateRandomString();
  let theLongURL = `http://${req.body.longURL}`;
  urlDatabase[shortURL] = {"userID": req.session.user_id};
  urlDatabase[shortURL].shortURL = shortURL;
  urlDatabase[shortURL].longURL = theLongURL;
  // console.log();
  res.redirect('/urls/' + shortURL);

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
})


app.post("/urls/:id/delete", (req, res) => {

  let deletURL = req.params.id;
  console.log(deletURL);
  delete urlDatabase[deletURL];
  console.log(urlDatabase);
  res.redirect('/urls');
})



app.post("/logout", (req, res) => {
  res.session = null;
  console.log("log out session:");
  // console.log(res.session.user_id);
  res.redirect('/');
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