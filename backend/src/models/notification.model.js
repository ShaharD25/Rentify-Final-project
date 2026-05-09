const mongoose = require("mongoose");

/*
This file defines the Notification model.
A notification is used for renter invitations and future system updates.
*/

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            default: null
        },

        type: {
            type: String,
            enum: ["property_invitation"],
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        isRead: {
            type: Boolean,
            default: false
        },

        invitationStatus: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Notification", notificationSchema);