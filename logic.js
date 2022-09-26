const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const sqlite3 = require("sqlite3");
const dummyData = require("./dummy-data");
const app = express();
const db = new sqlite3.Database("public/database.db");

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);
app.set("view engine", "hbs");

app.use(express.static("public"));

app.use(
  express.urlencoded({
    extended: false,
  })
);

//leads to the homepage
app.get("/", function (req, res) {
  const model = { homePage: true, pageName: "Home" };
  res.render("index.hbs", model);
});

//leads to display of portfolio
app.get("/works", function (req, res) {
  const query = "SELECT * FROM portfolio_entries";
  db.all(query, function (error, portfolio_entries) {
    const model = {
      entries: portfolio_entries,
      worksPage: true,
      pageName: "Portfolio",
    };
    res.render("works.hbs", model);
  });
});
app.get("/works/create", function (req, res) {
  res.render("works-create.hbs");
});
app.post("/works/create", function (req, res) {
  res.redirect("/works");
});

app.get("/blog", function (req, res) {
  const query = "SELECT * FROM blog_posts";
  db.all(query, function (error, blog_posts) {
    const model = {
      posts: blog_posts,
      blogPage: true,
      pageName: "Blog",
    };
    res.render("blog.hbs", model);
  });
});
app.get("/blog/create", function (req, res) {
  res.render("blog-create.hbs");
});
app.post("/blog/create", function (req, res) {
  res.redirect("/blog");
});

app.get("/contact", function (req, res) {
  const query = "SELECT * FROM faq_entries";
  db.all(query, function (error, faq_entries) {
    const model = {
      entries: faq_entries,
      contactPage: true,
      pageName: "Contact",
    };
    res.render("contact.hbs", model);
  });
});
app.get("/contact/create", function (req, res) {
  res.render("contact-create.hbs");
});
app.post("/contact/create", function (req, res) {
  const question = req.body.question;
  const answer = req.body.answer;

  const errorMessages = [];

  if (question && answer) {
    dummyData.faqEntries.push({
      id: 2,
      question: question,
      answer: answer,
    });
    res.redirect("/contact");
  } else {
    errorMessages.push("All fields must contain text");
    res.render("contact-create.hbs", {
      question: question,
      answer: answer,
      errorMessages,
    });
  }
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
