// Handles HTTP requests related to authentication (signup and login)
const authService = require("../services/auth.service");

/*
Signup controller:
Receives user registration data, performs basic validation,
and delegates the business logic to the auth service.
*/
async function signup(req, res) {
  // Extract fields from request body
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    securityQuestion,
    securityAnswer
  } = req.body;

  // Check that all required fields exist
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword ||
    !securityQuestion ||
    !securityAnswer
  ) {
    return res.status(400).json({
      message: "All required fields must be filled!"
    });
  }

  // Check that password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Password and confirmation do not match"
    });
  }

  // Delegate signup logic to the service
  const result = await authService.signup(req.body);

  return res.status(result.success ? 201 : 409).json(result);
}

/*
Login controller:
Receives login credentials and delegates authentication logic to the service.
*/
async function login(req, res) {
  // Extract fields from request body
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  // Delegate login logic to the service
  const result = await authService.login({
    email: email.trim(),
    password: password.trim()
  });

  return res.status(result.success ? 200 : 401).json(result);
}


/*
Role selection controller:
Receives the selected role and updates it for the matching user.
*/
async function updateUserRole(req, res) {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({
      message: "User id and role are required"
    });
  }

  if (!["homeowner", "renter"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role selected"
    });
  }

  const result = await authService.updateUserRole({ userId, role });

  return res.status(result.success ? 200 : 404).json(result);
}

/*
Forgot password controller:
Receives an email and returns the user's security question.
*/
async function getSecurityQuestion(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  const result = await authService.getSecurityQuestion(email);

  return res.status(result.success ? 200 : 404).json(result);
}

/*
Verify security answer controller:
Checks whether the provided answer matches the saved answer.
*/
async function verifySecurityAnswer(req, res) {
  const { email, securityAnswer } = req.body;

  if (!email || !securityAnswer) {
    return res.status(400).json({
      message: "Email and security answer are required"
    });
  }

  const result = await authService.verifySecurityAnswer({
    email,
    securityAnswer
  });

  return res.status(result.success ? 200 : 401).json(result);
}

/*
Reset password controller:
Receives a new password and updates it for the matching user.
*/
async function resetPassword(req, res) {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message: "Email, new password, and confirmation are required"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: "Password and confirmation do not match"
    });
  }

  const result = await authService.resetPassword({
    email,
    newPassword
  });

  return res.status(result.success ? 200 : 400).json(result);
}

module.exports = { signup, login, updateUserRole, getSecurityQuestion ,verifySecurityAnswer,
  resetPassword  }; 
  