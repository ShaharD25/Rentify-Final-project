/*
Contains the business logic for authentication.
Handles user signup and login operations.
*/

const bcrypt = require("bcrypt");
const User = require("../models/user");

/*
Handles user signup logic.
Checks if the email already exists, creates a new user,
saves the user to the database, and returns the result.
*/
async function signup(userData) {
  const {
    firstName,
    lastName,
    email,
    password,
    securityQuestion,
    securityAnswer
  } = userData;

  // Normalize email before checking
  const normalizedEmail = email.trim().toLowerCase();

  // Check if a user with the same email already exists
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return {
      success: false,
      message: "Email already exists in the system."
    };
  }

  // Create a new user instance
  const newUser = new User({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    securityQuestion,
    securityAnswer
  });

  // Save the user to the database
  await newUser.save();

  return {
    success: true,
    message: "User registered successfully!"
    ,user: {
      id: newUser._id
    }
  };
}

/*
Handles user login logic.
Checks if the user exists, compares passwords,
and returns the result.
*/
async function login(credentials) {
  const { email, password } = credentials;

  // Normalize email before searching
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user exists
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      success: false,
      message: "The email or password is incorrect. Please try again."
    };
  }

  // Compare entered password with the saved hashed password
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return {
      success: false,
      message: "The email or password is incorrect. Please try again."
    };
  }

  return {
    success: true,
    message: "Login successful!",
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }
  };
}

module.exports = { signup, login };