const mongoose = require("mongoose");

/*
This file defines the Chat model.
Each chat belongs to one property and contains messages between the Homeowner and Renters.
*/

const chatMessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        senderRole: {
            type: String,
            enum: ["homeowner", "renter"],
            required: true
        },

        senderName: {
            type: String,
            required: true,
            trim: true
        },

        text: {
            type: String,
            default: "",
            trim: true
        },

        fileUrl: {
            type: String,
            default: ""
        },

        fileName: {
            type: String,
            default: ""
        },

        fileType: {
            type: String,
            default: ""
        },

        readBy: {
            type: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true
                    },
                    readAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const chatSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
            unique: true
        },

        messages: {
            type: [chatMessageSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Chat", chatSchema);