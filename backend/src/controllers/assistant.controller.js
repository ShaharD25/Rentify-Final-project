const assistantService = require("../services/assistant.service");

/*
Ask the smart assistant a question.
*/
async function askAssistant(req, res) {
    const { userId, role, question } = req.body;

    if (!userId || !role || !question) {
        return res.status(400).json({
            success: false,
            message: "User id, role, and question are required."
        });
    }

    const result = await assistantService.askAssistant({
        userId,
        role,
        question
    });

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Generate chat reply suggestions for Homeowner.
*/
async function generateChatReplySuggestions(req, res) {
    const { propertyId, userId, role } = req.body;

    if (!propertyId || !userId || !role) {
        return res.status(400).json({
            success: false,
            message: "Property id, user id, and role are required."
        });
    }

    const result = await assistantService.generateChatReplySuggestions(
        propertyId,
        userId,
        role
    );

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    askAssistant,
    generateChatReplySuggestions
};