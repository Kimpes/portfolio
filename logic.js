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
    //loops through all dates and makes them readable
    for (const entry of portfolio_entries) {
      const postTime = new Date(entry.post_date);
      entry.post_date = postTime.toDateString();
    }
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
  const title = req.body.title;
  const description = req.body.description;
  const tag1 = req.body.tag1;
  const tag2 = req.body.tag2;
  const imageName = req.body.imageName;
  const errorMessages = [];
  const failureModel = {
    title,
    description,
    tag1,
    tag2,
    imageName,
    errorMessages,
  };

  if (!title.length || !description.length || !imageName.length) {
    errorMessages.push("No fields can be left empty");
  }
  if (imageName != "work_skogskott" && imageName.length) {
    errorMessages.push("Image name does not exist in file system");
  }
  if (tag1 == tag2) {
    errorMessages.push("Both tags cannot be the same");
  }

  if (errorMessages.length) {
    res.render("works-create.hbs", failureModel);
  } else {
    const currentTime = new Date();
    const postDate = currentTime.getTime();
    const query =
      "INSERT INTO portfolio_entries (title, description, post_date, tag_1, tag_2, image_name) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [title, description, postDate, tag1, tag2, imageName];
    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push(error);
        res.render("works-create.hbs", failureModel);
      } else {
        res.redirect("/works");
      }
    });
  }
});

app.get("/blog", function (req, res) {
  const query = "SELECT * FROM blog_posts";
  db.all(query, function (error, blog_posts) {
    for (const post of blog_posts) {
      const postTime = new Date(post.post_date);
      post.post_date = postTime.toDateString();
    }
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
  const title = req.body.title;
  const description = req.body.description;
  const errorMessages = [];
  const failureModel = {
    title,
    description,
    errorMessages,
  };

  if (!title.length || !description.length) {
    errorMessages.push("All fields must contain text");
  }

  if (errorMessages.length) {
    res.render("blog-create.hbs", failureModel);
  } else {
    const currentTime = new Date();
    const postDate = currentTime.getTime();
    const query =
      "INSERT INTO blog_posts (title, description, post_date) VALUES (?, ?, ?)";
    const values = [title, description, postDate];
    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("blog-create.hbs", failureModel);
      } else {
        res.redirect("/blog");
      }
    });
  }
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
  const failureModel = {
    question,
    answer,
    errorMessages,
  };

  if (!question.length || !answer.length) {
    errorMessages.push("All fields must contain text");
  }

  if (errorMessages.length) {
    res.render("contact-create.hbs", failureModel);
  } else {
    const query = "INSERT INTO faq_entries (question, answer) VALUES (?, ?)";
    const values = [question, answer];
    db.run(query, values, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("contact-create.hbs", failureModel);
      } else {
        res.redirect("/contact");
      }
    });
  }
});

app.listen(8080);
//change to 80 later (supposedly the standard)

// app.get ('/mainpage', function (req, res){}) is a middlewear

//TODO:
// - add empty states for all resources
// - correct implementation of the date system
// - reverse chronological order
// - use password = request.body.password and the others
// - install express-session to handle logins
// - find way of getting actual dates for database entries
// - find a way to preselect list items in work submittion failure
// - actually check image names instead of just hard coding one
// - make error title disappear if no errors
// - add upper limit for titles & descriptions
