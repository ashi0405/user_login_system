const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcrypt");
const cookieParser=require('cookie-parser')

const session = require("express-session");

var mongoose = require("mongoose");

require('dotenv').config()

const user=process.env.DB_USER
const password=process.env.DB_PASS

mongoose
  // .connect("mongodb://localhost/users")

  .connect(`mongodb+srv://${user}:${password}@cluster0.iyviz.mongodb.net/users?retryWrites=true&w=majority`,{useUnifiedTopology:true,useNewUrlParser:true})
  .then(console.log("Connected to Mongodb..."))
  .catch((e) => {
    console.log("Some Error occured..",e);
  });



// view engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

const { Users, validateUser, validateCurrentuser } = require("./models/user");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret is here",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.get("/", function (req, res, next) {
  res.location('/redirect')
  res.redirect('/register')
  // res.render("register", { title: "Register" });

 
});

app.get("/register", (req, res) => {
 
  res.render("register", { title: "Register" });
});

app.post("/register", async (req, res) => {

  const { error } = validateUser(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
  } else {
    let user = await Users.findOne({ email: req.body.email });

    if (user) {
      req.flash("error", "User Exists!");
    } else {
      user = new Users({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();

      req.flash("success", "You have been registered successfully");
    }
  }

  res.location("/");
  res.redirect("/");
});

app.get("/login", (req, res) => {

  res.render("login", { title: "Login" });
});

app.post("/login", async (req, res) => {

  const { error } = validateCurrentuser(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    res.location("/login");
    res.redirect("/login");
  } 
  
  else {
    let currentUser = await Users.findOne({ email: req.body.email });
    if (!currentUser) {
      req.flash("error", "Invalid Email"); 
    }


    else {
      let userPassword = await bcrypt.compare(
        req.body.password,
        currentUser.password
      );

      if (!userPassword) {
        req.flash("error", "Invalid Password");
       
      } 
      else {
        req.flash('success','You have been Logged in successfully')
      }
     
    }

    res.location("/login");
    res.redirect("/login");
  }
});

// app.get("/welcome", (req, res) => {
//   console.log("welcome site is here");
//   res.render("website");
// });

// app.post("/logout", (req, res) => {
//   res.location("/login");
//   res.redirect("/login");
// });

const port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log(`Server Has Started at port: ${port}`);
});



