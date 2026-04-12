// auth.routes.js
// Defines authentication-related API routes
console.log("AUTH ROUTES FILE LOADED - V2");

const express = require("express");
const router = express.Router();
const { signup, login, updateUserRole, getSecurityQuestion, verifySecurityAnswer,
  resetPassword } = require("../controllers/auth.controller");
/*
Signup route
POST /api/auth/signup
*/
router.post("/auth/signup", signup);

/*
Login route
POST /api/auth/login
*/
router.post("/auth/login", login);

/*
Role selection route
PUT /api/auth/role
*/
router.put("/auth/role", updateUserRole);

/*
Forgot password route
POST /api/auth/forgot-password/question
*/
router.post("/auth/forgot-password/question", getSecurityQuestion);

/*
Forgot password answer verification route
POST /api/auth/forgot-password/verify-answer
*/
router.post("/auth/forgot-password/verify-answer", verifySecurityAnswer);

/*
Forgot password answer verification route
POST /api/auth/forgot-password/verify-answer
*/
router.post("/auth/forgot-password/verify-answer", verifySecurityAnswer);

/*
Reset password route
PUT /api/auth/forgot-password/reset
*/
router.put("/auth/forgot-password/reset", resetPassword);
module.exports = router;
