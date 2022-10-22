const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const app = express();
const worksRouter = require("./routers/works-router.js");
const blogRouter = require("./routers/blog-router.js");
const contactRouter = require("./routers/contact-router.js");
const constants = require("./constants.js");
const bcrypt = require("bcrypt");

app.engine(
  "hbs",
  expressHandlebars.engine({
    defaultLayout: "main.hbs",
  })
);
app.set("views", "./Views");
app.set("view engine", "hbs");

app.use(express.static("public"));

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  expressSession({
    saveUninitialized: false,
    resave: false,
    secret: "FunkyBananasDancingWithSpears700",
  })
);

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use("/works", worksRouter);
app.use("/blog", blogRouter);
app.use("/contact", contactRouter);

//leads to the homepage
app.get("/", function (req, res) {
  const model = { homePage: true, pageName: "Home" };
  res.render("index", model);
});
app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const errorMessages = [];
  const failureModel = {
    username,
    password,
    errorMessages,
    homePage: true,
    pageName: "Home",
  };

  if (username != constants.constantVariables.ADMIN_NAME) {
    errorMessages.push("Incorrect login information");
    res.render("index.hbs", failureModel);
  } else {
    bcrypt.compare(
      password,
      constants.constantVariables.ADMIN_PASSWORD_HASH,
      function (error, result) {
        if (error) {
          errorMessages.push("Internal application error");
        }
        if (!result) {
          errorMessages.push("Incorrect login information");
        }
        if (errorMessages.length) {
          res.render("index.hbs", failureModel);
        } else {
          req.session.isLoggedIn = true;
          res.redirect("/");
        }
      }
    );
  }
});
app.post("/logout", function (req, res) {
  if (req.session.isLoggedIn == true) {
    req.session.isLoggedIn = false;
  }
  res.redirect("/");
});

app.listen(8080);
//change to 80 later (supposedly the standard)

//TODO:
// - find a way to preselect list items in work submittion failure (optional)
// - replace all placeholder entries with real ones
// - make the website look passable (optional)
// - make sure all names are good

//HIGH LEVEL TASKS:
// - explore all security vulnerabilities
// - prepare for launch
