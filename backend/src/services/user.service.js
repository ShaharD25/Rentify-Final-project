const User = require("../models/user");

/*
Get one user profile by id.
*/
async function getUserProfile(userId) {
    const user = await User.findById(userId).select(
        "firstName lastName email role securityQuestion createdAt"
    );

    if (!user) {
        return {
            success: false,
            message: "User not found."
        };
    }

    return {
        success: true,
        user
    };
}

/*
Update basic user profile details.
Allows editing first name, last name, and email.
*/
async function updateUserProfile(userId, profileData) {
    const { firstName, lastName, email } = profileData;

    if (!firstName || !lastName || !email) {
        return {
            success: false,
            message: "First name, last name, and email are required."
        };
    }

    const nameRegex = /^[A-Za-z]+$/;

    if (!nameRegex.test(firstName)) {
        return {
            success: false,
            message: "First name must contain letters only."
        };
    }

    if (!nameRegex.test(lastName)) {
        return {
            success: false,
            message: "Last name must contain letters only."
        };
    }

    const user = await User.findById(userId);

    if (!user) {
        return {
            success: false,
            message: "User not found."
        };
    }

    const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
    });

    if (existingUser) {
        return {
            success: false,
            message: "This email is already used by another account."
        };
    }

    user.firstName = firstName.trim();
    user.lastName = lastName.trim();
    user.email = email.toLowerCase().trim();

    await user.save();

    return {
        success: true,
        message: "Profile updated successfully.",
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            securityQuestion: user.securityQuestion
        }
    };
}

module.exports = {
    getUserProfile,
    updateUserProfile
};