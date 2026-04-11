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


module.exports = { signup, login, updateUserRole }; 