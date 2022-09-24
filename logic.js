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
  const model = { homePage: true, pageName: "Home" };
  res.render("index.hbs", model);
});

app.get("/works", function (req, res) {
  const model = {
    entries: dummyData.portfolioEntries,
    worksPage: true,
    pageName: "Portfolio",
  };
  res.render("works.hbs", model);
});

app.get("/blog", function (req, res) {
  const model = {
    posts: dummyData.blogPosts,
    blogPage: true,
    pageName: "Blog",
  };
  res.render("blog.hbs", model);
});
app.get("/blog/create", function (req, res) {
  res.render("blog-create.hbs");
});
app.post("/blog/create", function (req, res) {
  res.redirect("/blog");
});

app.get("/contact", function (req, res) {
  const model = {
    entries: dummyData.faqEntries,
    contactPage: true,
    pageName: "Contact",
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
// - install sqlite 3
// - db.run(sql code here)
// - const db = new sqlite3.Database("database.db")
// - const query = "SELECT * FROM movies"
// - db.all(query, function(error, movies){callback function, model + render(page, model)}
// - validate inputs: const errorMessages = []; push("this went wrong")
// - app.post: post request, data in body, extract with function from photos
// - use app.redirect after correct post
// - display errors on input page
// - in handlebars, display array strings with "this"
// - use password = request.body.password and the others
// - install express-session to handle logins
