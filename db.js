const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("public/database.db");

db.run(
  "CREATE TABLE IF NOT EXISTS faq_entries ( faqID INTEGER PRIMARY KEY, question TEXT, answer TEXT )"
);
db.run(
  "CREATE TABLE IF NOT EXISTS blog_posts ( blogID INTEGER PRIMARY KEY, title TEXT, description TEXT, post_date INTEGER )"
);
db.run(
  "CREATE TABLE IF NOT EXISTS portfolio_entries ( portfolioID INTEGER PRIMARY KEY, title TEXT, description TEXT, post_date INTEGER, tag_1 TEXT, tag_2 TEXT, image_name TEXT )"
);

//get all tables

exports.getAllPortfolioEntries = function (callback) {
  const query = "SELECT * FROM portfolio_entries";
  db.all(query, function (error, portfolio_entries) {
    callback(error, portfolio_entries);
  });
};

exports.getAllBlogPosts = function (callback) {
  const query = "SELECT * FROM blog_posts";
  db.all(query, function (error, blog_posts) {
    callback(error, blog_posts);
  });
};

exports.getAllFaqEntries = function (callback) {
  const query = "SELECT * FROM faq_entries";
  db.all(query, function (error, faq_entries) {
    callback(error, faq_entries);
  });
};

//create new entries

exports.createPortfolioEntry = function (
  title,
  description,
  tag1,
  tag2,
  imageName,
  callback
) {
  const currentTime = new Date();
  const postDate = currentTime.getTime();
  const query =
    "INSERT INTO portfolio_entries (title, description, post_date, tag_1, tag_2, image_name) VALUES (?, ?, ?, ?, ?, ?)";
  const values = [title, description, postDate, tag1, tag2, imageName];
  db.run(query, values, function (error) {
    callback(error);
  });
};

exports.createBlogPost = function (title, description, callback) {
  const currentTime = new Date();
  const postDate = currentTime.getTime();
  const query =
    "INSERT INTO blog_posts (title, description, post_date) VALUES (?, ?, ?)";
  const values = [title, description, postDate];
  db.run(query, values, function (error) {
    callback(error);
  });
};

exports.createFaqEntry = function (question, answer, callback) {
  const query = "INSERT INTO faq_entries (question, answer) VALUES (?, ?)";
  const values = [question, answer];
  db.run(query, values, function (error) {
    callback(error);
  });
};

//select entries

exports.selectPortfolioEntry = function (id, callback) {
  const query = "SELECT * FROM portfolio_entries WHERE portfolioID = ? ";
  const values = [id];
  db.get(query, values, function (error, entry) {
    callback(error, entry);
  });
};

exports.selectBlogPost = function (id, callback) {
  const query = "SELECT * FROM blog_posts WHERE blogID = ? ";
  const values = [id];
  db.get(query, values, function (error, entry) {
    callback(error, entry);
  });
};

exports.selectFaqEntry = function (id, callback) {
  const query = "SELECT * FROM faq_entries WHERE faqID = ? ";
  const values = [id];
  db.get(query, values, function (error, entry) {
    callback(error, entry);
  });
};

//update entries

exports.updatePortfolioEntry = function (
  title,
  description,
  tag1,
  tag2,
  imageName,
  id,
  callback
) {
  const query =
    "UPDATE portfolio_entries SET title = ?, description = ?, tag_1 = ?, tag_2 = ?, image_name = ? WHERE portfolioID = ?";
  const values = [title, description, tag1, tag2, imageName, id];
  db.run(query, values, function (error) {
    callback(error);
  });
};

exports.updateBlogPost = function (title, description, id, callback) {
  const query =
    "UPDATE blog_posts SET title = ?, description = ? WHERE blogID = ?";
  const values = [title, description, id];
  db.run(query, values, function (error) {
    callback(error);
  });
};

exports.updateFaqEntry = function (question, answer, id, callback) {
  const query =
    "UPDATE faq_entries SET question = ?, answer = ? WHERE faqID = ? ";
  const values = [question, answer, id];
  db.run(query, values, function (error) {
    callback(error);
  });
};

//delete entries

exports.deletePortfolioEntry = function (id, callback) {
  const query = "DELETE FROM portfolio_entries WHERE portfolioID = ?";
  const values = [id];
  db.get(query, values, function (error) {
    callback(error);
  });
};

exports.deleteBlogPost = function (id, callback) {
  const query = "DELETE FROM blog_posts WHERE blogID = ?";
  const values = [id];
  db.get(query, values, function (error) {
    callback(error);
  });
};

exports.deleteFaqEntry = function (id, callback) {
  const query = "DELETE FROM faq_entries WHERE faqID = ?";
  const values = [id];
  db.get(query, values, function (error) {
    callback(error);
  });
};
