const express = require("express");
const router = express.Router();
const uploadIssueImage = require("../middlewares/uploadIssueImage.middleware");

const {
    createIssue,
    getHomeownerIssues,
    getPropertyIssues,
    getIssueById,
    updateIssueStatus,
    addIssueMessage
} = require("../controllers/issue.controller");

/*
Create a new issue
POST /api/issues
*/
router.post("/issues", uploadIssueImage.single("issueImage"), createIssue);

/*
Get all issues for one homeowner
GET /api/issues/homeowner/:homeownerId
*/
router.get("/issues/homeowner/:homeownerId", getHomeownerIssues);

/*
Get all issues for one property
GET /api/issues/property/:propertyId
*/
router.get("/issues/property/:propertyId", getPropertyIssues);

/*
Get one issue by id
GET /api/issues/:issueId
*/
router.get("/issues/:issueId", getIssueById);

/*
Update one issue status
PUT /api/issues/:issueId/status
*/
router.put("/issues/:issueId/status", updateIssueStatus);

/*
Add a message to an issue
POST /api/issues/:issueId/messages
*/
router.post("/issues/:issueId/messages", addIssueMessage);

module.exports = router;