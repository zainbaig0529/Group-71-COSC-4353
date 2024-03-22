const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.static('assets'));
app.use(express.static('src'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/homepage.html");
});

app.listen(3000, function () {
  console.log("Server is running on localhost3000");
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/profile_management", function (req, res) {
  res.sendFile(__dirname + "/public/profile management.html");
});

app.get("/registration", function (req, res) {
  res.sendFile(__dirname + "/public/registration.html");
});

app.get("/fuel_quote_history", function (req, res) {
  res.sendFile(__dirname + "/public/fuel_quote_history.html");
});

app.get("/fuel_quote_form", function (req, res) {
  res.sendFile(__dirname + "/public/fuel_quote_form.html");
});

app.get("/customer_info_form", function (req, res) {
  res.sendFile(__dirname + "/public/customer_info_form.html");
});