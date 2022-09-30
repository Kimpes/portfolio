const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const sqlite3 = require("sqlite3");
const dummyData = require("./dummy-data");
const app = express();
const db = new sqlite3.Database("public/database.db");

const ADMIN_NAME = "Kimpes";
const ADMIN_PASSWORD = "123";
const MAX_TITLE_LENGTH = 256;
const MAX_DESCRIPTION_LENGTH = 1024;

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

//leads to the homepage
app.get("/", function (req, res) {
  const model = { homePage: true, pageName: "Home" };
  res.render("index.hbs", model);
});
app.post("/", function (req, res) {
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

  if (username != ADMIN_NAME || password != ADMIN_PASSWORD) {
    errorMessages.push("Incorrect login information");
  }

  if (errorMessages.length) {
    res.render("index.hbs", failureModel);
  } else {
    req.session.isLoggedIn = true;
    res.redirect("/");
  }
});
app.post("/logout", function (req, res) {
  if (req.session.isLoggedIn == true) {
    req.session.isLoggedIn = false;
  }
  res.redirect("/");
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
  if (req.session.isLoggedIn) {
    res.render("works-create.hbs");
  }
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
  if (title.length > MAX_TITLE_LENGTH) {
    errorMessages.push(
      "Title cannot be longer than " + MAX_TITLE_LENGTH + " characters"
    );
  }
  if (title.length > MAX_DESCRIPTION_LENGTH) {
    errorMessages.push(
      "Description cannot be longer than " +
        MAX_DESCRIPTION_LENGTH +
        " characters"
    );
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
app.get("/works/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/works");
  } else {
    const id = req.params.id;
    const errorMessages = [];
    const failureModel = {
      errorMessages,
    };
    const query = "SELECT * FROM portfolio_entries WHERE portfolioID = ? ";

    db.get(query, [id], function (error, entry) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("works-create.hbs", failureModel);
      } else {
        const model = {
          title: entry.title,
          description: entry.description,
          imageName: entry.image_name,
          id,
        };
        res.render("works-create.hbs", model);
      }
    });
  }
});
app.post("/works/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/blog");
  } else {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const tag1 = req.body.tag1;
    const tag2 = req.body.tag2;
    const imageName = req.body.imageName;
    const errorMessages = [];
    const failureModel = {
      id,
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
    if (title.length > MAX_TITLE_LENGTH) {
      errorMessages.push(
        "Title cannot be longer than " + MAX_TITLE_LENGTH + " characters"
      );
    }
    if (title.length > MAX_DESCRIPTION_LENGTH) {
      errorMessages.push(
        "Description cannot be longer than " +
          MAX_DESCRIPTION_LENGTH +
          " characters"
      );
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
      const query =
        "UPDATE portfolio_entries SET title = ?, description = ?, tag_1 = ?, tag_2 = ?, image_name = ? WHERE portfolioID = ?";
      const values = [title, description, tag1, tag2, imageName, id];
      db.run(query, values, function (error) {
        if (error) {
          errorMessages.push("Internal server error");
          res.render("works-create.hbs", failureModel);
        } else {
          res.redirect("/works");
        }
      });
    }
  }
});
app.post("/works/delete/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/works");
  } else {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const imageName = req.body.image_name;
    const errorMessages = [];
    const failureModel = {
      id,
      title,
      description,
      imageName,
      errorMessages,
    };
    const query = "DELETE FROM portfolio_entries WHERE portfolioID = ?";
    db.run(query, [id], function (error) {
      if (error) {
        errorMessages.push("Internal server error");
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
  if (req.session.isLoggedIn) {
    res.render("blog-create.hbs");
  }
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
  if (title.length > MAX_TITLE_LENGTH) {
    errorMessages.push(
      "Title cannot be longer than " + MAX_TITLE_LENGTH + " characters"
    );
  }
  if (title.length > MAX_DESCRIPTION_LENGTH) {
    errorMessages.push(
      "Description cannot be longer than " +
        MAX_DESCRIPTION_LENGTH +
        " characters"
    );
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
app.get("/blog/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/blog");
  } else {
    const id = req.params.id;
    const errorMessages = [];
    const failureModel = {
      errorMessages,
    };
    const query = "SELECT * FROM blog_posts WHERE blogID = ? ";

    db.get(query, [id], function (error, entry) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("blog-create.hbs", failureModel);
      } else {
        const model = {
          title: entry.title,
          description: entry.description,
          id, //if there's a specific id sent, it's in edit mode and not create mode
        };
        res.render("blog-create.hbs", model);
      }
    });
  }
});
app.post("/blog/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/blog");
  } else {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const errorMessages = [];
    const failureModel = {
      id,
      title,
      description,
      errorMessages,
    };

    if (!title.length || !description.length) {
      errorMessages.push("All fields must contain text");
    }
    if (title.length > MAX_TITLE_LENGTH) {
      errorMessages.push(
        "Title cannot be longer than " + MAX_TITLE_LENGTH + " characters"
      );
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      errorMessages.push(
        "Description cannot be longer than " +
          MAX_DESCRIPTION_LENGTH +
          " characters"
      );
    }

    if (errorMessages.length) {
      res.render("blog-create.hbs", failureModel);
    } else {
      const query =
        "UPDATE blog_posts SET title = ?, description = ? WHERE blogID = ?";
      const values = [title, description, id];
      db.run(query, values, function (error) {
        if (error) {
          errorMessages.push("Internal server error");
          res.render("blog-create.hbs", failureModel);
        } else {
          res.redirect("/blog");
        }
      });
    }
  }
});
app.post("/blog/delete/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/blog");
  } else {
    const id = req.params.id;
    const title = req.body.title;
    const description = req.body.description;
    const errorMessages = [];
    const failureModel = {
      id,
      title,
      description,
      errorMessages,
    };
    const query = "DELETE FROM blog_posts WHERE blogID = ?";
    db.run(query, [id], function (error) {
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
  if (req.session.isLoggedIn) {
    res.render("contact-create.hbs");
  }
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
  if (question.length > MAX_TITLE_LENGTH) {
    errorMessages.push(
      "Question cannot be longer than " + MAX_TITLE_LENGTH + " characters"
    );
  }
  if (answer.length > MAX_DESCRIPTION_LENGTH) {
    errorMessages.push(
      "Answer cannot be longer than " + MAX_DESCRIPTION_LENGTH + " characters"
    );
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
app.get("/contact/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/contact");
  } else {
    const id = req.params.id;
    const errorMessages = [];
    const failureModel = {
      errorMessages,
    };
    const query = "SELECT * FROM faq_entries WHERE faqID = ? ";

    db.get(query, [id], function (error, entry) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("contact-create.hbs", failureModel);
      } else {
        const model = {
          question: entry.question,
          answer: entry.answer,
          id, //if there's a specific id sent, it's in edit mode and not create mode
        };
        res.render("contact-create.hbs", model);
      }
    });
  }
});
app.post("/contact/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/contact");
  } else {
    const id = req.params.id;
    const question = req.body.question;
    const answer = req.body.answer;
    const errorMessages = [];
    const failureModel = {
      id,
      question,
      answer,
      errorMessages,
    };

    if (!question.length || !answer.length) {
      errorMessages.push("All fields must contain text");
    }
    if (question.length > MAX_TITLE_LENGTH) {
      errorMessages.push(
        "Question cannot be longer than " + MAX_TITLE_LENGTH + " characters"
      );
    }
    if (answer.length > MAX_DESCRIPTION_LENGTH) {
      errorMessages.push(
        "Answer cannot be longer than " + MAX_DESCRIPTION_LENGTH + " characters"
      );
    }

    if (errorMessages.length) {
      res.render("contact-create.hbs", failureModel);
    } else {
      const query =
        "UPDATE faq_entries SET question = ?, answer = ? WHERE faqID = ? ";
      const values = [question, answer, id];
      db.run(query, values, function (error) {
        if (error) {
          errorMessages.push("Internal server error");
          res.render("contact-create.hbs", failureModel);
        } else {
          res.redirect("/contact");
        }
      });
    }
  }
});
app.post("/contact/delete/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/contact");
  } else {
    const id = req.params.id;
    const question = req.body.question;
    const answer = req.body.answer;
    const errorMessages = [];
    const failureModel = {
      id,
      question,
      answer,
      errorMessages,
    };
    const query = "DELETE FROM faq_entries WHERE faqID = ?";
    db.run(query, [id], function (error) {
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
// - reverse chronological order
// - find a way to preselect list items in work submittion failure
// - actually check image names instead of just hard coding one
// - be able to remove posts
// - be able to update posts
// - add cancel and delete buttons to contact edit page

// - Add pagination
// - Add search engine
// - Add image upload
