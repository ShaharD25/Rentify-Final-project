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
      email: user.email,
      role: user.role
    }
  };
}

/*
Handles user role selection logic.
Updates the selected role for an existing user.
*/
async function updateUserRole(roleData) {
  const { userId, role } = roleData;

  const user = await User.findById(userId);

  if (!user) {
    return {
      success: false,
      message: "User not found."
    };
  }

  user.role = role;
  await user.save();

  return {
    success: true,
    message: "User role updated successfully.",
    user: {
      id: user._id,
      role: user.role
    }
  };
}

/*
Get the security question for a user by email.
*/
async function getSecurityQuestion(email) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      success: false,
      message: "No account was found for this email."
    };
  }

  return {
    success: true,
    securityQuestion: user.securityQuestion
  };
}

/*
Verify the user's answer to the security question.
*/
async function verifySecurityAnswer(answerData) {
  const { email, securityAnswer } = answerData;

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      success: false,
      message: "No account was found for this email."
    };
  }

  const isAnswerMatch = await bcrypt.compare(
    securityAnswer,
    user.securityAnswer
  );

  if (!isAnswerMatch) {
    return {
      success: false,
      message: "Incorrect answer. Please try again."
    };
  }

  return {
    success: true,
    message: "Answer verified successfully."
  };
}

/*
Reset the user's password after successful identity verification.
*/
async function resetPassword(resetData) {
  const { email, newPassword } = resetData;

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return {
      success: false,
      message: "No account was found for this email."
    };
  }

  // Prevent using the current password again.
const isSamePassword = await bcrypt.compare(newPassword, user.password);

if (isSamePassword) {
  return {
    success: false,
    message: "The new password must be different from the current password."
  };
}

  user.password = newPassword;
  await user.save();

  return {
    success: true,
    message: "Password updated successfully."
  };
}

module.exports = { signup, login, updateUserRole, getSecurityQuestion, verifySecurityAnswer, resetPassword };