const express = require("express");
const router = express.Router();
const db = require("../db.js");
const universalFunctions = require("../universalFunctions.js");
const constants = require("../constants.js");

router.get("/", function (req, res) {
  db.getAllBlogPosts(function (error, blog_posts) {
    for (const post of blog_posts) {
      const postTime = new Date(post.post_date);
      post.post_date = postTime.toDateString();
    }
    blog_posts = blog_posts.reverse();
    const currentPageNr = parseInt(req.query.page) || 1;
    let currentPageEntries = [];

    const pageInfo = universalFunctions.retrievePageInfo(
      currentPageNr,
      blog_posts,
      constants.constantVariables.BLOG_POSTS_PER_PAGE
    );

    for (let i = 0; i < constants.constantVariables.BLOG_POSTS_PER_PAGE; i++) {
      if (
        blog_posts[
          i +
            (pageInfo.currentPageNr - 1) *
              constants.constantVariables.BLOG_POSTS_PER_PAGE
        ]
      ) {
        currentPageEntries.push(
          blog_posts[
            i +
              (pageInfo.currentPageNr - 1) *
                constants.constantVariables.BLOG_POSTS_PER_PAGE
          ]
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
router.get("/create", function (req, res) {
  if (req.session.isLoggedIn) {
    res.render("blog-create.hbs");
  }
});
router.post("/create", function (req, res) {
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
  if (title.length > constants.constantVariables.MAX_TITLE_LENGTH) {
    errorMessages.push(
      "Title cannot be longer than " +
        constants.constantVariables.MAX_TITLE_LENGTH +
        " characters"
    );
  }
  if (title.length > constants.constantVariables.MAX_DESCRIPTION_LENGTH) {
    errorMessages.push(
      "Description cannot be longer than " +
        constants.constantVariables.MAX_DESCRIPTION_LENGTH +
        " characters"
    );
  }

  if (errorMessages.length) {
    res.render("blog-create.hbs", failureModel);
  } else {
    db.createBlogPost(title, description, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("blog-create.hbs", failureModel);
      } else {
        res.redirect("/blog");
      }
    });
  }
});
router.get("/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/blog");
  } else {
    const id = req.params.id;
    const errorMessages = [];
    const failureModel = {
      errorMessages,
    };

    db.selectBlogPost(id, function (error, entry) {
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
router.post("/edit/:id", function (req, res) {
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
    if (title.length > constants.constantVariables.MAX_TITLE_LENGTH) {
      errorMessages.push(
        "Title cannot be longer than " +
          constants.constantVariables.MAX_TITLE_LENGTH +
          " characters"
      );
    }
    if (
      description.length > constants.constantVariables.MAX_DESCRIPTION_LENGTH
    ) {
      errorMessages.push(
        "Description cannot be longer than " +
          constants.constantVariables.MAX_DESCRIPTION_LENGTH +
          " characters"
      );
    }

    if (errorMessages.length) {
      res.render("blog-create.hbs", failureModel);
    } else {
      db.updateBlogPost(title, description, id, function (error) {
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
router.post("/delete/:id", function (req, res) {
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
    db.deleteBlogPost(id, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("blog-create.hbs", failureModel);
      } else {
        res.redirect("/blog");
      }
    });
  }
});

module.exports = router;
