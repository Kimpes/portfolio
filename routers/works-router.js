const express = require("express");
const app = express();
const router = express.Router();
const db = require("../db.js");
const universalFunctions = require("../universalFunctions.js");
const constants = require("../constants.js");
const multer = require("multer");

//code pertaining to image upload cited from https://www.npmjs.com/package/multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
});

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
router.post("/create", upload.single("imageName"), function (req, res) {
  const title = req.body.title;
  const description = req.body.description;
  const tag1 = req.body.tag1;
  const tag2 = req.body.tag2;
  let imageName;
  const errorMessages = [];
  const failureModel = {
    title,
    description,
    tag1,
    tag2,
    errorMessages,
  };

  if (req.file) {
    if (req.file.size > 10000000) {
      errorMessages.push("Image size can't be bigger than 10 MB");
    }
    imageName = req.file.filename;
  } else {
    errorMessages.push("Image is required to add an entry");
  }

  if (!title.length || !description.length) {
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
          res.redirect("/works");
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
    res.redirect("/works");
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
            res.redirect("/works");
          }
        }
      );
    }
  }
});
router.post("/delete/:id", function (req, res) {
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

    db.deletePortfolioEntry(id, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("works-create.hbs", failureModel);
      } else {
        res.redirect("/works");
      }
    });
  }
});

module.exports = router;
