const emailValidator = require("email-validator");
const validator = require("password-validator");

exports.validateUsername = (username) => {
  let schema = new validator();
  schema.is().min(3).is().max(25).has().not().spaces();
  return schema.validate(username);
};

exports.validatePassword = (username, password) => {
  let schema = new validator();
  schema
    .is()
    .min(8)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits(1)
    .has()
    .not()
    .spaces()
    .is()
    .not()
    .oneOf(["Passw0rd", "Password123", "password", "Password", username]);

  return schema.validate(password);
};

exports.validateName = (name) => {
  let schema = new validator();
  schema.is().min(1).is().max(100).has().not().spaces();
  return schema.validate(name);
};

exports.validateEmail = (email) => {
  return emailValidator.validate(email);
};
