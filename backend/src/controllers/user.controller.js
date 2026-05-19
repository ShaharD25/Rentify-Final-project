const userService = require("../services/user.service");

/*
Get user profile.
*/
async function getUserProfile(req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User id is required."
        });
    }

    const result = await userService.getUserProfile(userId);

    return res.status(result.success ? 200 : 404).json(result);
}

/*
Update user profile.
*/
async function updateUserProfile(req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User id is required."
        });
    }

    const result = await userService.updateUserProfile(userId, req.body);

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    getUserProfile,
    updateUserProfile
};