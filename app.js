//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const { render } = require("ejs");
const bcrypt = require("bcrypt");
const { dropWhile } = require("lodash");
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const url =
  "mongodb+srv://" +
  process.env.USERNAMEE +
  ":" +
  process.env.PASSWORD +
  "@cluster0.qcanqcf.mongodb.net/HCI";
mongoose.connect(url, { useNewUrlParser: true });

//Schema for the user
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

var User = mongoose.model("User", userSchema);

//Schema for the post

const Complaintschema = {
  FirstName: String,
  LastName: String,
  Email: String,
  Password: String,
  CityName: String,
  PhoneNumber: String,
  PersonInvolved: String,
  Relevent_Information: String,
  Signature: String,
  Date: String,
};

var Complaint = mongoose.model("Complaint", Complaintschema);

//Home page

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/complaints", function (req, res) {
  res.render("complaints");
});

app.post("/complaints", function (req, res) {
  var FirstName = req.body.FirstName;
  var LastName = req.body.LastName;
  var Email = req.body.Email;
  var Date = req.body.Date;
  var CityName = req.body.CityName;
  var Phone = req.body.Phone;
  var PersonInvolved = req.body.PersonInvolved;
  var Relevent_Information = req.body.Relevent_Information;
  var Signature = req.body.Signature;

  const newComplaint = new Complaint({
    FirstName: FirstName,
    LastName: LastName,
    Email: Email,
    Phone: Phone,
    CityName: CityName,
    PersonInvolved: PersonInvolved,
    Relevent_Information: Relevent_Information,
    Signature: Signature,
    Date: Date,
  });

  newComplaint.save();
  res.redirect("/successful");
});

//-----------Delete Complaint------------
app.post("/delete", function (req, res) {
  

// get successful page
app.get("/successful", function (req, res) {
  res.render("successful");
});

// -----------Registration--------------

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  //--------HASHING------------
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    const newuser = new User({
      username: req.body.username,
      password: hash,
    });
    newuser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("successful");
      }
    });
  });
});



//bool to check whether the user has logged in or not
let isUserAuthenticated = false;

//------------Logout-------------

app.post("/logout", function (req, res) {
  isUserAuthenticated = false;
  res.redirect("/login");
});

// -----------Login--------------

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function (err, result) {
          if (result === true) {
            isUserAuthenticated = true;
            res.redirect("/admin");
          } else {
            res.render("login");
          }
        });
      }
    }
  });
});

// Forbiddon page
app.get("/forbiddon", function (req, res) {
  res.render("forbiddon");
});

// -----------Admin--------------
app.get("/admin", function (req, res) {
  if (isUserAuthenticated) {
    Complaint.find({}, function (err, foundComplaints) {
      res.render("admin", { complaints: foundComplaints });
    });
  } else {
    res.render("forbiddon");
  }
});

app.post("/admin", function (req, res) {
  const checkedComplaintId = req.body.checkbox;
  Complaint.findByIdAndRemove(checkedComplaintId, function (err) {
    if (!err) {
      console.log("Successfully deleted checked item.");
      res.redirect("/admin");
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
