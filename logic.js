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
  res.render("index.hbs");
});

app.use(express.static("public"));

app.get("/works", function (req, res) {
  const model = {
    entries: dummyData.portfolio_entries,
  };
  res.render("works.hbs", model);
});
app.get("/index", function (req, res) {
  res.render("index.hbs");
});
app.get("/blog", function (req, res) {
  const model = {
    posts: dummyData.blog_posts,
  };
  res.render("blog.hbs", model);
});
app.get("/contact", function (req, res) {
  const model = {
    entries: dummyData.faq_entries,
  };
  res.render("contact.hbs", model);
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

//TODO:
// - add empty states for all resources
// - correct implementation of the date system
// - reverse chronological order
// - make responsiveness, add breakpoints for grids n shit
