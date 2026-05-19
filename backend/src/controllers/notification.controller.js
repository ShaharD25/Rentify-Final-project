const notificationService = require("../services/notification.service");

/*
Create a property invitation for a renter.
*/
async function createPropertyInvitation(req, res) {
    const { homeownerId, propertyId, renterEmail } = req.body;

    if (!homeownerId || !propertyId || !renterEmail) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id, property id, and renter email are required."
        });
    }

    const result = await notificationService.createPropertyInvitation({
        homeownerId,
        propertyId,
        renterEmail
    });

    return res.status(result.success ? 201 : 400).json(result);
}

/*
Get all notifications for one renter.
*/
async function getRenterNotifications(req, res) {
    const { renterId } = req.params;

    if (!renterId) {
        return res.status(400).json({
            success: false,
            message: "Renter id is required."
        });
    }

    const result = await notificationService.getRenterNotifications(renterId);

    return res.status(200).json(result);
}

/*
Get all notifications for one user.
Used by both Homeowner and Renter.
*/
async function getUserNotifications(req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User id is required."
        });
    }

    const result = await notificationService.getUserNotifications(userId);

    return res.status(200).json(result);
}


/*
Get unread notification count for one user.
Used by both Homeowner and Renter.
*/
async function getUnreadNotificationCount(req, res) {
    const userId = req.params.userId || req.params.renterId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "User id is required."
        });
    }

    const result = await notificationService.getUnreadNotificationCount(userId);

    return res.status(200).json(result);
}

/*
Mark one notification as read.
*/
async function markNotificationAsRead(req, res) {
    const { notificationId } = req.params;

    if (!notificationId) {
        return res.status(400).json({
            success: false,
            message: "Notification id is required."
        });
    }

    const result = await notificationService.markNotificationAsRead(notificationId);

    return res.status(result.success ? 200 : 404).json(result);
}

/*
Get one notification by id.
*/
async function getNotificationById(req, res) {
    const { notificationId } = req.params;
    const { userId } = req.query;

    if (!notificationId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Notification id and user id are required."
        });
    }

    const result = await notificationService.getNotificationById(
        notificationId,
        userId
    );

    return res.status(result.success ? 200 : 404).json(result);
}

/*
Accept a property invitation.
*/
async function acceptPropertyInvitation(req, res) {
    const { notificationId } = req.params;
    const { renterId } = req.body;

    if (!notificationId || !renterId) {
        return res.status(400).json({
            success: false,
            message: "Notification id and renter id are required."
        });
    }

    const result = await notificationService.acceptPropertyInvitation(
        notificationId,
        renterId
    );

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Decline a property invitation.
*/
async function declinePropertyInvitation(req, res) {
    const { notificationId } = req.params;
    const { renterId } = req.body;

    if (!notificationId || !renterId) {
        return res.status(400).json({
            success: false,
            message: "Notification id and renter id are required."
        });
    }

    const result = await notificationService.declinePropertyInvitation(
        notificationId,
        renterId
    );

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    createPropertyInvitation,
    getRenterNotifications,
    getUserNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    getNotificationById,
    acceptPropertyInvitation,
    declinePropertyInvitation
};