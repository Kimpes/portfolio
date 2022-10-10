const bcrypt = require("bcrypt");
const salt = 10;
const adminPassword = "DancingBananas999";

bcrypt.hash(adminPassword, salt, function (err, hash) {
  console.log(hash);
});

//$2b$10$Vn5lH/.fhqW729yVSwLXaO38Fxv9PpFZy0QQH6kRTP6BZZdyXlRc.
