const express = require("express");
const app = express();
const router = express.Router();
const db = require("../db.js");
const universalFunctions = require("../universalFunctions.js");
const constants = require("../constants.js");

router.get("/", function (req, res) {
  db.getAllPortfolioEntries(function (error, portfolio_entries) {
    //loops through all dates and makes them readable
    for (const entry of portfolio_entries) {
      const postTime = new Date(entry.post_date);
      entry.post_date = postTime.toDateString();
    }
    portfolio_entries = portfolio_entries.reverse();
    const currentPageNr = parseInt(req.query.page) || 1;
    let currentPageEntries = [];

    const pageInfo = universalFunctions.retrievePageInfo(
      currentPageNr,
      portfolio_entries,
      constants.constantVariables.WORK_ENTRIES_PER_PAGE
    );

    for (
      let i = 0;
      i < constants.constantVariables.WORK_ENTRIES_PER_PAGE;
      i++
    ) {
      if (
        portfolio_entries[
          i +
            (pageInfo.currentPageNr - 1) *
              constants.constantVariables.WORK_ENTRIES_PER_PAGE
        ]
      ) {
        currentPageEntries.push(
          portfolio_entries[
            i +
              (pageInfo.currentPageNr - 1) *
                constants.constantVariables.WORK_ENTRIES_PER_PAGE
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
router.get("/create", function (req, res) {
  if (req.session.isLoggedIn) {
    res.render("works-create.hbs");
  }
});
router.post("/create", function (req, res) {
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
  if (imageName != "work_skogskott" && imageName.length) {
    errorMessages.push("Image name does not exist in file system");
  }
  if (tag1 == tag2) {
    errorMessages.push("Both tags cannot be the same");
  }

  if (errorMessages.length) {
    res.render("works-create.hbs", failureModel);
  } else {
    db.createPortfolioEntry(
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
          res.redirect("/");
        }
      }
    );
  }
});
router.get("/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/");
  } else {
    const id = req.params.id;
    const errorMessages = [];
    const failureModel = {
      errorMessages,
    };

    db.selectPortfolioEntry(id, function (error, entry) {
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
router.post("/edit/:id", function (req, res) {
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
    if (imageName != "work_skogskott" && imageName.length) {
      errorMessages.push("Image name does not exist in file system");
    }
    if (tag1 == tag2) {
      errorMessages.push("Both tags cannot be the same");
    }

    if (errorMessages.length) {
      res.render("works-create.hbs", failureModel);
    } else {
      db.updatePortfolioEntry(
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
            res.redirect("/");
          }
        }
      );
    }
  }
});
router.post("/delete/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/");
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

    db.deletePortfolioEntry(id, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("works-create.hbs", failureModel);
      } else {
        res.redirect("/");
      }
    });
  }
});

module.exports = router;
