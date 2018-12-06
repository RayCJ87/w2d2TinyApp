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
const users = {};
// const userLIst = [];

app.get("/", (req, res) => {
  let templateVars = {username: req.cookies.username};
  res.render("./partials/_header", templateVars);
});

app.get("/login", (req,res) => {
  res.render("urls_login");
})


app.post("/login", (req, res) => {

  //loop through users to find req.body.*
  let email = req.body.email;
  let password = req.body.password;
  console.log(email);
  const theUser = authenticateUser(email);
  res.cookie('user_id', theUser.user_id);


  if (theUser) {
    if (email == theUser.email && password == theUser.password){
      console.log("login success!");
      res.redirect("/urls");
    }
    else {
      console.log("login failed.");
    }

  }
  else {
    res.redirect('/register');
  }
});

app.get("/register", (req, res) => {
  res.render("urls_registration");

})

app.post("/register", (req, res) => {
    const { email, password} = req.body;
      let randomID = generateRandomString();
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
      const userID = registerUser(randomID, email, password);
      console.log(users);
      res.redirect("/urls");
    }
})


function authenticateUser (userMail) {
  for (var u in users) {
    if (userMail === users[u].email){
      return users[u];
    }
    console.log(userMail);
  }
  return false;
}

function registerUser (randomID, email, password) {
  users[randomID] = {id: randomID, email: email, password: password};
  console.log(users[randomID]);
  return randomID;

}


app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase,
                      user: req.cookies["user_id"] };
  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        urls: urlDatabase,
                        user: req.cookies["user_id"]};
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


app.post("/urls/:id/delete", (req, res) => {

  let deletURL = req.params.id;
  console.log(deletURL);
  delete urlDatabase[deletURL];
  console.log(urlDatabase);
  res.redirect('/urls');
})



app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(req.cookie);
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