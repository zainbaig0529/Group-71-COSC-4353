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