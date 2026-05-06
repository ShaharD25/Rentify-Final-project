const issueService = require("../services/issue.service");

/*
Create a new issue.
*/
async function createIssue(req, res) {
    const {
        propertyId,
        title,
        description,
        imageUrl,
        createdByRenterName
    } = req.body;

    if (!propertyId || !title || !description) {
        return res.status(400).json({
            success: false,
            message: "Property id, title, and description are required."
        });
    }

    const result = await issueService.createIssue({
        propertyId,
        title,
        description,
        imageUrl,
        createdByRenterName
    });

    return res.status(result.success ? 201 : 400).json(result);
}

/*
Get all issues for one homeowner.
*/
async function getHomeownerIssues(req, res) {
    const { homeownerId } = req.params;

    if (!homeownerId) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id is required."
        });
    }

    const result = await issueService.getHomeownerIssues(homeownerId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Get all issues for one property.
*/
async function getPropertyIssues(req, res) {
    const { propertyId } = req.params;

    if (!propertyId) {
        return res.status(400).json({
            success: false,
            message: "Property id is required."
        });
    }

    const result = await issueService.getPropertyIssues(propertyId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Get one issue by id.
*/
async function getIssueById(req, res) {
    const { issueId } = req.params;

    if (!issueId) {
        return res.status(400).json({
            success: false,
            message: "Issue id is required."
        });
    }

    const result = await issueService.getIssueById(issueId);

    return res.status(result.success ? 200 : 404).json(result);
}

/*
Update issue status.
*/
async function updateIssueStatus(req, res) {
    const { issueId } = req.params;
    const { status } = req.body;

    if (!issueId) {
        return res.status(400).json({
            success: false,
            message: "Issue id is required."
        });
    }

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Status is required."
        });
    }

    const result = await issueService.updateIssueStatus(issueId, status);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Add a message to an issue thread.
*/
async function addIssueMessage(req, res) {
    const { issueId } = req.params;
    const {
        senderRole,
        senderName,
        text
    } = req.body;

    if (!issueId) {
        return res.status(400).json({
            success: false,
            message: "Issue id is required."
        });
    }

    if (!senderRole || !senderName || !text) {
        return res.status(400).json({
            success: false,
            message: "Sender role, sender name, and text are required."
        });
    }

    const result = await issueService.addIssueMessage(issueId, {
        senderRole,
        senderName,
        text
    });

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    createIssue,
    getHomeownerIssues,
    getPropertyIssues,
    getIssueById,
    updateIssueStatus,
    addIssueMessage
};