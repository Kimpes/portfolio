const express = require("express");
const router = express.Router();
const db = require("../db.js");
const universalFunctions = require("../universalFunctions.js");
const constants = require("../constants.js");

router.get("/", function (req, res) {
  db.getAllFaqEntries(function (error, faq_entries) {
    const currentPageNr = parseInt(req.query.page) || 1;
    let currentPageEntries = [];

    const pageInfo = universalFunctions.retrievePageInfo(
      currentPageNr,
      faq_entries,
      constants.constantVariables.FAQ_ENTRIES_PER_PAGE
    );

    for (let i = 0; i < constants.constantVariables.FAQ_ENTRIES_PER_PAGE; i++) {
      if (
        faq_entries[
          i +
            (pageInfo.currentPageNr - 1) *
              constants.constantVariables.FAQ_ENTRIES_PER_PAGE
        ]
      ) {
        currentPageEntries.push(
          faq_entries[
            i +
              (pageInfo.currentPageNr - 1) *
                constants.constantVariables.FAQ_ENTRIES_PER_PAGE
          ]
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
router.get("/create", function (req, res) {
  if (req.session.isLoggedIn) {
    res.render("contact-create.hbs");
  }
});
router.post("/create", function (req, res) {
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
  if (question.length > constants.constantVariables.MAX_TITLE_LENGTH) {
    errorMessages.push(
      "Question cannot be longer than " +
        constants.constantVariables.MAX_TITLE_LENGTH +
        " characters"
    );
  }
  if (answer.length > constants.constantVariables.MAX_DESCRIPTION_LENGTH) {
    errorMessages.push(
      "Answer cannot be longer than " +
        constants.constantVariables.MAX_DESCRIPTION_LENGTH +
        " characters"
    );
  }

  if (errorMessages.length) {
    res.render("contact-create.hbs", failureModel);
  } else {
    db.createFaqEntry(question, answer, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("contact-create.hbs", failureModel);
      } else {
        res.redirect("/contact");
      }
    });
  }
});
router.get("/edit/:id", function (req, res) {
  if (!req.session.isLoggedIn) {
    res.redirect("/contact");
  } else {
    const id = req.params.id;
    const errorMessages = [];
    const failureModel = {
      errorMessages,
    };

    db.selectFaqEntry(id, function (error, entry) {
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
router.post("/edit/:id", function (req, res) {
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
    if (question.length > constants.constantVariables.MAX_TITLE_LENGTH) {
      errorMessages.push(
        "Question cannot be longer than " +
          constants.constantVariables.MAX_TITLE_LENGTH +
          " characters"
      );
    }
    if (answer.length > constants.constantVariables.MAX_DESCRIPTION_LENGTH) {
      errorMessages.push(
        "Answer cannot be longer than " +
          constants.constantVariables.MAX_DESCRIPTION_LENGTH +
          " characters"
      );
    }

    if (errorMessages.length) {
      res.render("contact-create.hbs", failureModel);
    } else {
      db.updateFaqEntry(question, answer, id, function (error) {
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
router.post("/delete/:id", function (req, res) {
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

    db.deleteFaqEntry(id, function (error) {
      if (error) {
        errorMessages.push("Internal server error");
        res.render("contact-create.hbs", failureModel);
      } else {
        res.redirect("/contact");
      }
    });
  }
});

module.exports = router;
