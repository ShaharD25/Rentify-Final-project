const Issue = require("../models/issue.model");
const Property = require("../models/property.model");
const User = require("../models/user");


/*
Analyze an issue using smart rule-based logic.
This detects category, priority, and a short AI-style summary.
*/
function analyzeIssue(title, description = "") {
    const combinedText = `${title} ${description}`.toLowerCase();

    const plumbingKeywords = [
        "water",
        "leak",
        "pipe",
        "sink",
        "toilet",
        "bathroom",
        "shower",
        "drain",
        "flood",
        "wet"
    ];

    const electricityKeywords = [
        "electric",
        "electricity",
        "power",
        "light",
        "socket",
        "switch",
        "fuse",
        "lamp",
        "spark",
        "short circuit"
    ];

    const highPriorityKeywords = [
        "flood",
        "spark",
        "smoke",
        "fire",
        "no power",
        "danger",
        "urgent",
        "ceiling leak",
        "burst"
    ];

    const mediumPriorityKeywords = [
        "leak",
        "broken",
        "not working",
        "blocked",
        "no hot water",
        "power issue"
    ];

    let category = "maintenance";

    if (plumbingKeywords.some((keyword) => combinedText.includes(keyword))) {
        category = "plumbing";
    }

    if (electricityKeywords.some((keyword) => combinedText.includes(keyword))) {
        category = "electricity";
    }

    let priority = "low";

    if (mediumPriorityKeywords.some((keyword) => combinedText.includes(keyword))) {
        priority = "medium";
    }

    if (highPriorityKeywords.some((keyword) => combinedText.includes(keyword))) {
        priority = "high";
    }

    let aiSummary = "The issue was classified as a general maintenance request.";

    if (category === "plumbing" && priority === "high") {
        aiSummary = "The issue may require urgent attention because it mentions a serious water or leak-related problem.";
    } else if (category === "plumbing") {
        aiSummary = "The issue appears to be related to plumbing and should be checked by maintenance.";
    } else if (category === "electricity" && priority === "high") {
        aiSummary = "The issue may require urgent attention because it mentions a potentially dangerous electrical problem.";
    } else if (category === "electricity") {
        aiSummary = "The issue appears to be related to electricity and should be reviewed carefully.";
    } else if (priority === "high") {
        aiSummary = "The issue was marked as high priority because the description may indicate urgent damage or safety risk.";
    } else if (priority === "medium") {
        aiSummary = "The issue was marked as medium priority because it may affect normal apartment usage.";
    }

    return {
        category,
        priority,
        aiSummary
    };
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
        createdByRenter,
        createdByRenterName
    } = issueData;

    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    if (createdByRenter) {
        const isRenterLinkedToProperty = (property.renters || []).some((renterItem) => {
            const currentRenterId = renterItem.renter || renterItem;
            return currentRenterId.toString() === createdByRenter.toString();
        });

        if (!isRenterLinkedToProperty) {
            return {
                success: false,
                message: "This renter is not linked to this property."
            };
        }
    }

    const issueAnalysis = analyzeIssue(title, description || "");

    const newIssue = new Issue({
        property: propertyId,
        title: title.trim(),
        description: description ? description.trim() : "",
        imageUrl: imageUrl || "",
        category: issueAnalysis.category,
        priority: issueAnalysis.priority,
        aiSummary: issueAnalysis.aiSummary,
        createdByRenter: createdByRenter || null,
        createdByRenterName: createdByRenterName || ""
    });

    await newIssue.save();

    const populatedIssue = await Issue.findById(newIssue._id)
        .populate("property", "fullAddress homeowner")
        .populate("createdByRenter", "firstName lastName email role");

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
        .populate("createdByRenter", "firstName lastName email role")
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
        .populate("createdByRenter", "firstName lastName email role")
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