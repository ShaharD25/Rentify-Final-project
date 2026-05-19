const mongoose = require("mongoose");

/*
This file defines the Payment model.
A payment belongs to one property and stores monthly rent payment tracking data.
*/

const paymentSchema = new mongoose.Schema(
    {
        property: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true
        },

        homeowner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Reference to the renter connected to this payment.
        renter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        renterName: {
            type: String,
            required: true,
            trim: true
        },

        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12
        },

        year: {
            type: Number,
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

        status: {
            type: String,
            enum: ["unpaid", "paid", "late"],
            default: "unpaid"
        },

        paidAt: {
            type: Date,
            default: null
        },

        riskFlag: {
            type: Boolean,
            default: false
        },

        riskReason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

paymentSchema.index(
    { property: 1, renter: 1, month: 1, year: 1 },
    { unique: true }
);

module.exports = mongoose.model("Payment", paymentSchema);