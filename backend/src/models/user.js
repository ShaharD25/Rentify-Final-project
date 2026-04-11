const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/*
This file defines the User model.
A model describes how user data looks and how it is saved in the database.
*/


const nameRegex = /^[A-Za-z]+$/;

/*
This regex checks that the password is strong.
Rules:
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
*/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Defines all fields that a user must have in the system.
const userSchema = new mongoose.Schema(
  {
    // First name must exist and contain only English letters.
    firstName: {
      type: String,
      required: true,
      match: nameRegex,
      trim: true
    },

    // Last name must exist and contain only English letters.
    lastName: {
      type: String,
      required: true,
      match: nameRegex,
      trim: true
    },

    // User email address
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // User password
    password: {
      type: String,
      required: true,
      match: passwordRegex
    },

    // Security question for password recovery
    securityQuestion: {
      type: String,
      required: true
    },

    // Answer to the security question
    securityAnswer: {
      type: String,
      required: true
    },

    // User role in the system
    role: {
      type: String,
      enum: ["homeowner", "renter"],
      default: null
    }

    // User role (owner / renter) will be added later
  },
  {
    // Automatically adds createdAt and updatedAt
    timestamps: true
  }
);

/*
Encrypt password and security answer before saving the user.
*/
userSchema.pre("save", async function () {

  // Protect password before saving
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Protect security answer before saving
  if (this.isModified("securityAnswer")) {
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, 10);
  }

});

/*
Export the User model
*/
module.exports = mongoose.model("User", userSchema);
