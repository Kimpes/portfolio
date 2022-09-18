// const http = require('http');
// const fs = require('fs');

// const myServer = http.createServer(function(req, res){
//     res.statusCode = 200;
//     res.setHeader("Content-Type", "text/html");
//     res.end(<p>this is a response</p>);
// });

const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const app = express();

//code cited from https://stackoverflow.com/questions/35133573/import-external-file-content-into-handlebar
app.use(express.static("/public"));

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "./main.hbs",
  })
);
app.set("view engine", "hbs");

app.get("/", function (req, res) {
  const model = {
    humans: dummyData.humans,
  };
  res.render("show-all-humans.hbs", model);
});

app.use(express.static("public"));

app.get("/works", function (req, res) {
  res.render("works.hbs");
});
app.get("/index", function (req, res) {
  res.render("index.hbs");
});
app.get("/blog", function (req, res) {
  res.render("blog.hbs");
});
app.get("/qna", function (req, res) {
  res.render("qna.hbs");
});

app.listen(8080);
//change to 80 later (supposedly the standard)

//this entire file should be modified to accomodate express intead of http
// app.get ('/mainpage', function (req, res){}) is a middlewear
// res.sendFile("file.html") to display html??

//don't forget to specify the handlebars require("express-handlebars")
//app.engine('hbs', expressHandlebars({ extname: ".hbs"; })) something like that.
//response.render("file.hbs") or something like that.
//use different hbs for different pages?
//static middlewear to find public files for easy access?
