const express = require("express");
const router = express.Router();

const {
    createPropertyInvitation,
    getRenterNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    acceptPropertyInvitation,
    declinePropertyInvitation
} = require("../controllers/notification.controller");

/*
Create property invitation
POST /api/notifications/property-invitation
*/
router.post("/notifications/property-invitation", createPropertyInvitation);

/*
Get notifications for one renter
GET /api/notifications/renter/:renterId
*/
router.get("/notifications/renter/:renterId", getRenterNotifications);

/*
Get unread notification count for one renter
GET /api/notifications/renter/:renterId/unread-count
*/
router.get("/notifications/renter/:renterId/unread-count", getUnreadNotificationCount);

/*
Mark notification as read
PUT /api/notifications/:notificationId/read
*/
router.put("/notifications/:notificationId/read", markNotificationAsRead);

/*
Accept property invitation
PUT /api/notifications/:notificationId/accept
*/
router.put("/notifications/:notificationId/accept", acceptPropertyInvitation);

/*
Decline property invitation
PUT /api/notifications/:notificationId/decline
*/
router.put("/notifications/:notificationId/decline", declinePropertyInvitation);

module.exports = router;