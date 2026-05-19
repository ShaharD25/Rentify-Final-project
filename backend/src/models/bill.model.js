const mongoose = require("mongoose");

/*
Bill model.
Stores apartment bills created by Renters and linked to a Property.
*/

const billSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true
        },

        createdByRenter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        dueDate: {
            type: Date,
            required: true
        },

        category: {
            type: String,
            enum: [
                "electricity",
                "water",
                "gas",
                "internet",
                "municipal_tax",
                "maintenance",
                "other"
            ],
            required: true
        },

        description: {
            type: String,
            default: "",
            trim: true
        },

        isUnusual: {
            type: Boolean,
            default: false
        },

        anomalyReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Bill", billSchema);