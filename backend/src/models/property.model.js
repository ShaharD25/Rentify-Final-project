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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Property", propertySchema);