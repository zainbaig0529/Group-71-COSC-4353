const express = require('express');
var bodyParser=require("body-parser");
const app = express();
const PORT = 3000;

//tell app where to find static content
app.use(express.static('public'));
app.use(express.static('assets'));
app.use(express.static('src'));

//middleware for login page
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/homepage.html");
});

app.post('/login.html', function (req, res) {
    console.log(req.body.email);
});

app.listen(3000, function () {
  console.log("Server is running on localhost3000");
});

