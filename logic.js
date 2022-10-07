const express = require("express");
const expressHandlebars = require("express-handlebars");
const expressSession = require("express-session");
const app = express();
const dbFile = require("./db.js");

const ADMIN_NAME = "Kimpes";
const ADMIN_PASSWORD = "123";
const MAX_TITLE_LENGTH = 256;
const MAX_DESCRIPTION_LENGTH = 1024;
const FAQ_ENTRIES_PER_PAGE = 5;
const BLOG_POSTS_PER_PAGE = 2;
const WORK_ENTRIES_PER_PAGE = 2;

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
  dbFile.getAllPortfolioEntries(function (error, portfolio_entries) {
    //loops through all dates and makes them readable
    for (const entry of portfolio_entries) {
      const postTime = new Date(entry.post_date);
      entry.post_date = postTime.toDateString();
    }
    portfolio_entries = portfolio_entries.reverse();
    const currentPageNr = parseInt(req.query.page) || 1;
    let currentPageEntries = [];

    const pageInfo = RetrievePageInfo(
      currentPageNr,
      portfolio_entries,
      WORK_ENTRIES_PER_PAGE
    );

    for (let i = 0; i < WORK_ENTRIES_PER_PAGE; i++) {
      if (
        portfolio_entries[
          i + (pageInfo.currentPageNr - 1) * WORK_ENTRIES_PER_PAGE
        ]
      ) {
        currentPageEntries.push(
          portfolio_entries[
            i + (pageInfo.currentPageNr - 1) * WORK_ENTRIES_PER_PAGE
          ]
        ); //page 2 has index 1
      }
    }
    const model = {
      currentPageEntries,
      worksPage: true,
      pageName: "Portfolio",
      pageInfo,
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
    dbFile.createPortfolioEntry(
      title,
      description,
      tag1,
      tag2,
      imageName,
      function (error) {
        if (error) {
          errorMessages.push(error);
          res.render("works-create.hbs", failureModel);
        } else {
          res.redirect("/works");
        }
      }
    );
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

    dbFile.selectPortfolioEntry(id, function (error, entry) {
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
      dbFile.updatePortfolioEntry(
        title,
        description,
        tag1,
        tag2,
        imageName,
        id,
        function (error) {
          if (error) {
            errorMessages.push("Internal server error");
            res.render("works-create.hbs", failureModel);
          } else {
            res.redirect("/works");
          }
        }
      );
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

    dbFile.deletePortfolioEntry(id, function (error) {
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
  dbFile.getAllBlogPosts(function (error, blog_posts) {
    for (const post of blog_posts) {
      const postTime = new Date(post.post_date);
      post.post_date = postTime.toDateString();
    }
    blog_posts = blog_posts.reverse();
    const currentPageNr = parseInt(req.query.page) || 1;
    let currentPageEntries = [];

    const pageInfo = RetrievePageInfo(
      currentPageNr,
      blog_posts,
      BLOG_POSTS_PER_PAGE
    );

    for (let i = 0; i < BLOG_POSTS_PER_PAGE; i++) {
      if (blog_posts[i + (pageInfo.currentPageNr - 1) * BLOG_POSTS_PER_PAGE]) {
        currentPageEntries.push(
          blog_posts[i + (pageInfo.currentPageNr - 1) * BLOG_POSTS_PER_PAGE]
        ); //page 2 has index 1
      }
    }
    const model = {
      currentPageEntries,
      blogPage: true,
      pageName: "Blog",
      pageInfo,
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
    dbFile.createBlogPost(title, description, function (error) {
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

    dbFile.selectBlogPost(id, function (error, entry) {
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
      dbFile.updateBlogPost(title, description, id, function (error) {
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
    dbFile.deleteBlogPost(id, function (error) {
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
  dbFile.getAllFaqEntries(function (error, faq_entries) {
    const currentPageNr = parseInt(req.query.page) || 1;
    let currentPageEntries = [];

    const pageInfo = RetrievePageInfo(
      currentPageNr,
      faq_entries,
      FAQ_ENTRIES_PER_PAGE
    );

    for (let i = 0; i < FAQ_ENTRIES_PER_PAGE; i++) {
      if (
        faq_entries[i + (pageInfo.currentPageNr - 1) * FAQ_ENTRIES_PER_PAGE]
      ) {
        currentPageEntries.push(
          faq_entries[i + (pageInfo.currentPageNr - 1) * FAQ_ENTRIES_PER_PAGE]
        ); //page 2 has index 1
      }
    }

    const model = {
      entries: currentPageEntries,
      contactPage: true,
      pageName: "Contact",
      pageInfo,
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
    dbFile.createFaqEntry(question, answer, function (error) {
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

    dbFile.selectFaqEntry(id, function (error, entry) {
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
      dbFile.updateFaqEntry(question, answer, id, function (error) {
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

    dbFile.deleteFaqEntry(id, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("contact-create.hbs", failureModel);
      } else {
        res.redirect("/contact");
      }
    });
  }
});

function RetrievePageInfo(currentPageNr, table, entriesPerPage) {
  const prevPageNr = currentPageNr - 1;
  const nextPageNr = currentPageNr + 1;
  let isFinalPage = false;
  let firstPageNumberIsNeeded = false;
  let finalPageNumberIsNeeded = false;
  let pagesNeeded = 0; //0 is falsy and therefore useful. we will of course need at least one page

  if (table.length > entriesPerPage) {
    pagesNeeded = table.length / entriesPerPage;
    pagesNeeded = Math.ceil(pagesNeeded);
    if (nextPageNr < pagesNeeded) {
      finalPageNumberIsNeeded = true;
    }
    if (prevPageNr > 1) {
      firstPageNumberIsNeeded = true;
    }
    if (currentPageNr >= pagesNeeded) {
      isFinalPage = true;
    }
  }
  if (currentPageNr > pagesNeeded) {
    currentPageNr = 1;
  }

  return {
    currentPageNr,
    prevPageNr,
    nextPageNr,
    finalPage: isFinalPage,
    firstPageNumberIsNeeded,
    finalPageNumberIsNeeded,
    pagesNeeded,
  };
}

app.listen(8080);
//change to 80 later (supposedly the standard)

//TODO:
// - find a way to preselect list items in work submittion failure
// - actually check image names instead of just hard coding one
// - replace all placeholder entries with real ones
// - make the blog and FAQ look passable (optional)
// - make sure all names are good
// - split database & http script into two files
// - make resources have their own files using routers

//HIGH LEVEL TASKS:
// - Add search engine (optional)
// - Add image upload
// - explore all security vulnerabilities
// - make code structure more structure
