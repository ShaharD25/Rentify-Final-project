const Issue = require("../models/issue.model");
const Property = require("../models/property.model");
const User = require("../models/user");

/*
Categorize an issue using simple rule-based logic.
*/
function categorizeIssue(title, description) {
    const combinedText = `${title} ${description}`.toLowerCase();

    const plumbingKeywords = [
        "water",
        "leak",
        "pipe",
        "sink",
        "toilet",
        "bathroom",
        "shower",
        "drain"
    ];

    const electricityKeywords = [
        "electric",
        "electricity",
        "power",
        "light",
        "socket",
        "switch",
        "fuse",
        "lamp"
    ];

    if (plumbingKeywords.some((keyword) => combinedText.includes(keyword))) {
        return "plumbing";
    }

    if (electricityKeywords.some((keyword) => combinedText.includes(keyword))) {
        return "electricity";
    }

    return "maintenance";
}

/*
Create a new issue for a property.
*/
async function createIssue(issueData) {
    const {
        propertyId,
        title,
        description,
        imageUrl,
        createdByRenterName
    } = issueData;

    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    const category = categorizeIssue(title, description);

    const newIssue = new Issue({
        property: propertyId,
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl || "",
        category,
        createdByRenterName: createdByRenterName || ""
    });

    await newIssue.save();

    const populatedIssue = await Issue.findById(newIssue._id).populate(
        "property",
        "fullAddress homeowner"
    );

    return {
        success: true,
        message: "Issue created successfully.",
        issue: populatedIssue
    };
}

/*
Get all issues for one homeowner.
*/
async function getHomeownerIssues(homeownerId) {
    const homeowner = await User.findById(homeownerId);

    if (!homeowner) {
        return {
            success: false,
            message: "Homeowner not found."
        };
    }

    if (homeowner.role !== "homeowner") {
        return {
            success: false,
            message: "Only a homeowner can view these issues."
        };
    }

    const properties = await Property.find({ homeowner: homeownerId }).select("_id");
    const propertyIds = properties.map((property) => property._id);

    const issues = await Issue.find({ property: { $in: propertyIds } })
        .populate("property", "fullAddress homeowner")
        .sort({ createdAt: -1 });

    return {
        success: true,
        issues
    };
}

/*
Get all issues linked to one property.
*/
async function getPropertyIssues(propertyId) {
    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    const issues = await Issue.find({ property: propertyId })
        .populate("property", "fullAddress homeowner")
        .sort({ createdAt: -1 });

    return {
        success: true,
        issues
    };
}

/*
Get one issue by id.
*/
async function getIssueById(issueId) {
    const issue = await Issue.findById(issueId).populate(
        "property",
        "fullAddress homeowner"
    );

    if (!issue) {
        return {
            success: false,
            message: "Issue not found."
        };
    }

    return {
        success: true,
        issue
    };
}

/*
Update the status of one issue.
*/
async function updateIssueStatus(issueId, status) {
    const allowedStatuses = ["open", "in_progress", "closed"];

    if (!allowedStatuses.includes(status)) {
        return {
            success: false,
            message: "Invalid issue status."
        };
    }

    const issue = await Issue.findById(issueId).populate(
        "property",
        "fullAddress homeowner"
    );

    if (!issue) {
        return {
            success: false,
            message: "Issue not found."
        };
    }

    issue.status = status;
    await issue.save();

    return {
        success: true,
        message: "Issue status updated successfully.",
        issue
    };
}

/*
Add a new message to an issue thread.
*/
async function addIssueMessage(issueId, messageData) {
    const {
        senderRole,
        senderName,
        text
    } = messageData;

    const issue = await Issue.findById(issueId).populate(
        "property",
        "fullAddress homeowner"
    );

    if (!issue) {
        return {
            success: false,
            message: "Issue not found."
        };
    }

    issue.messages.push({
        senderRole,
        senderName: senderName.trim(),
        text: text.trim()
    });

    await issue.save();

    return {
        success: true,
        message: "Message sent successfully.",
        issue
    };
}

module.exports = {
    createIssue,
    getHomeownerIssues,
    getPropertyIssues,
    getIssueById,
    updateIssueStatus,
    addIssueMessage
};