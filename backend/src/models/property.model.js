const mongoose = require("mongoose");

/*
This file defines the Property model.
A property belongs to one homeowner and stores the main rental details.
*/

const propertySchema = new mongoose.Schema(
    {
        // Full property address shown as the main property title in the UI.
        fullAddress: {
            type: String,
            required: true,
            trim: true
        },

        // Monthly rent amount in shekels.
        monthlyRent: {
            type: Number,
            required: true,
            min: 0
        },

        // Day of month used for billing.
        billingDate: {
            type: Number,
            required: true,
            min: 1,
            max: 31
        },

        // Rental start date.
        rentalStartDate: {
            type: Date,
            required: true
        },

        // Rental end date.
        rentalEndDate: {
            type: Date,
            required: true
        },

        // Reference to the homeowner who owns this property.
        homeowner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // List of renter users currently linked to this property.
        renters: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                }
            ],
            default: []
        },

        // Join code that allows a renter to connect to this property.
        renterJoinCode: {
            type: String,
            unique: true,
            sparse: true,
            default: ""
        },

        // Contract file name stored for display in the property details page.
        contractFileName: {
            type: String,
            default: ""
        },

        // Contract file path or URL placeholder for future upload support.
        contractFileUrl: {
            type: String,
            default: ""
        },



        // Date when the current contract was uploaded.
        contractUploadedAt: {
            type: Date,
            default: null
        },

        // Name of the user who uploaded the current contract.
        contractUploadedBy: {
            type: String,
            default: ""
        },

        // Archived contract versions kept for history.
        contractHistory: {
            type: [
                {
                    fileName: {
                        type: String,
                        default: ""
                    },
                    fileUrl: {
                        type: String,
                        default: ""
                    },
                    uploadedAt: {
                        type: Date,
                        default: null
                    },
                    uploadedBy: {
                        type: String,
                        default: ""
                    },
                    archivedAt: {
                        type: Date,
                        default: null
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

module.exports = mongoose.model("Property", propertySchema);