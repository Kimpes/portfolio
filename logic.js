const dummyData = require("./dummy-data");
const express = require("express");
const expressHandlebars = require("express-handlebars");
const app = express();

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);
app.set("view engine", "hbs");

app.use(express.static("public"));

//this section handles all get requests for pages
app.get("/", function (req, res) {
  res.render("index.hbs");
});
app.get("/works", function (req, res) {
  const model = {
    entries: dummyData.portfolioEntries,
  };
  res.render("works.hbs", model);
});
app.get("/blog", function (req, res) {
  const model = {
    posts: dummyData.blogPosts,
  };
  res.render("blog.hbs", model);
});
app.get("/contact", function (req, res) {
  const model = {
    entries: dummyData.faqEntries,
  };
  res.render("contact.hbs", model);
});

app.listen(8080);
//change to 80 later (supposedly the standard)

// app.get ('/mainpage', function (req, res){}) is a middlewear

//app.engine('hbs', expressHandlebars({ extname: ".hbs"; })) something like that.

//TODO:
// - add empty states for all resources
// - correct implementation of the date system
// - reverse chronological order
// - make responsiveness, add breakpoints for grids n shit
