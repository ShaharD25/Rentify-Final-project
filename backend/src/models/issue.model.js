const mongoose = require("mongoose");

/*
This file defines the Issue model.
An issue belongs to one property and stores maintenance details,
status, category, optional image, and a simple message thread.
*/

const issueMessageSchema = new mongoose.Schema(
  {
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
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const issueSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    imageUrl: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open"
    },

    category: {
      type: String,
      enum: ["maintenance", "plumbing", "electricity"],
      default: "maintenance"
    },

    createdByRenterName: {
      type: String,
      default: ""
    },

    messages: {
      type: [issueMessageSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Issue", issueSchema);