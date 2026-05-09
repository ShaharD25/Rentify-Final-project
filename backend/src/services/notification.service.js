const Notification = require("../models/notification.model");
const Property = require("../models/property.model");
const User = require("../models/user");

/*
Create a property invitation notification for a renter.
*/
async function createPropertyInvitation(invitationData) {
    const { homeownerId, propertyId, renterEmail } = invitationData;

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
            message: "Only a homeowner can send invitations."
        };
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    if (property.homeowner.toString() !== homeownerId.toString()) {
        return {
            success: false,
            message: "This property does not belong to this homeowner."
        };
    }

    const normalizedEmail = renterEmail.trim().toLowerCase();
    const renter = await User.findOne({ email: normalizedEmail });

    if (!renter) {
        return {
            success: false,
            message: "No renter account was found with this email."
        };
    }

    if (renter.role !== "renter") {
        return {
            success: false,
            message: "The selected user is not a renter."
        };
    }

    const isAlreadyLinked = property.renters.some(
        (renterId) => renterId.toString() === renter._id.toString()
    );

    if (isAlreadyLinked) {
        return {
            success: false,
            message: "This renter is already linked to this property."
        };
    }

    const existingPendingInvitation = await Notification.findOne({
        recipient: renter._id,
        sender: homeownerId,
        property: propertyId,
        type: "property_invitation",
        invitationStatus: "pending"
    });

    if (existingPendingInvitation) {
        return {
            success: false,
            message: "A pending invitation already exists for this renter."
        };
    }

    const notification = new Notification({
        recipient: renter._id,
        sender: homeownerId,
        property: propertyId,
        type: "property_invitation",
        title: "Property invitation",
        message: `${homeowner.firstName} ${homeowner.lastName} invited you to join ${property.fullAddress}.`
    });

    await notification.save();

    return {
        success: true,
        message: "Invitation sent successfully.",
        notification
    };
}

/*
Get all notifications for one renter.
*/
async function getRenterNotifications(renterId) {
    const notifications = await Notification.find({ recipient: renterId })
        .populate("sender", "firstName lastName email role")
        .populate("property", "fullAddress monthlyRent billingDate rentalStartDate rentalEndDate")
        .sort({ createdAt: -1 });

    return {
        success: true,
        notifications
    };
}

/*
Get unread notification count for one renter.
*/
async function getUnreadNotificationCount(renterId) {
    const count = await Notification.countDocuments({
        recipient: renterId,
        isRead: false
    });

    return {
        success: true,
        count
    };
}

/*
Mark one notification as read.
*/
async function markNotificationAsRead(notificationId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        return {
            success: false,
            message: "Notification not found."
        };
    }

    notification.isRead = true;
    await notification.save();

    return {
        success: true,
        notification
    };
}

/*
Accept a property invitation and link the renter to the property.
*/
async function acceptPropertyInvitation(notificationId, renterId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        return {
            success: false,
            message: "Notification not found."
        };
    }

    if (notification.recipient.toString() !== renterId.toString()) {
        return {
            success: false,
            message: "This notification does not belong to this renter."
        };
    }

    if (notification.type !== "property_invitation") {
        return {
            success: false,
            message: "Invalid notification type."
        };
    }

    if (notification.invitationStatus !== "pending") {
        return {
            success: false,
            message: "This invitation was already handled."
        };
    }

    const property = await Property.findById(notification.property);

    if (!property) {
        return {
            success: false,
            message: "Property not found."
        };
    }

    const isAlreadyLinked = property.renters.some((renterItem) => {
        const currentRenterId = renterItem.renter || renterItem;
        return currentRenterId.toString() === renterId.toString();
    });

    if (!isAlreadyLinked) {
        property.renters.push({
            renter: renterId,
            joinedAt: new Date()
        });

        await property.save();
    }

    notification.invitationStatus = "accepted";
    notification.isRead = true;
    await notification.save();

    const updatedProperty = await Property.findById(property._id)
        .populate("homeowner", "firstName lastName email role")
        .populate("renters.renter", "firstName lastName email role");

    return {
        success: true,
        message: "Invitation accepted successfully.",
        property: updatedProperty
    };
}


/*
Decline a property invitation.
*/
async function declinePropertyInvitation(notificationId, renterId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        return {
            success: false,
            message: "Notification not found."
        };
    }

    if (notification.recipient.toString() !== renterId.toString()) {
        return {
            success: false,
            message: "This notification does not belong to this renter."
        };
    }

    if (notification.invitationStatus !== "pending") {
        return {
            success: false,
            message: "This invitation was already handled."
        };
    }

    notification.invitationStatus = "declined";
    notification.isRead = true;
    await notification.save();

    return {
        success: true,
        message: "Invitation declined successfully.",
        notification
    };
}

module.exports = {
    createPropertyInvitation,
    getRenterNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    acceptPropertyInvitation,
    declinePropertyInvitation
};