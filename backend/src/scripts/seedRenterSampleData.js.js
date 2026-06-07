const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/user");
const Property = require("../models/property.model");
const Issue = require("../models/issue.model");
const Bill = require("../models/bill.model");
const Chat = require("../models/chat.model");
const Notification = require("../models/notification.model");

/*
Seed realistic sample data for the existing Renter account.
Adds bills, issues, chat history, roommate data, and notifications.
*/

const RENTER_EMAIL = "shahar.d25@gmail.com";
const SAMPLE_PASSWORD = "Demo1234";
const SECURITY_QUESTION = "What is your sample question?";
const SECURITY_ANSWER = "sample";

function buildDate(year, month, day, hour = 10, minute = 0) {
    return new Date(year, month - 1, day, hour, minute);
}

async function connectToDatabase() {
    const mongoUri =
        process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/rentify";

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
}

async function findRenter() {
    const renter = await User.findOne({
        email: RENTER_EMAIL.toLowerCase(),
        role: "renter"
    });

    if (!renter) {
        throw new Error(`Renter ${RENTER_EMAIL} was not found.`);
    }

    return renter;
}

async function createOrUpdateRoommate(roommateData) {
    let roommate = await User.findOne({ email: roommateData.email });

    if (!roommate) {
        roommate = new User({
            firstName: roommateData.firstName,
            lastName: roommateData.lastName,
            email: roommateData.email,
            password: SAMPLE_PASSWORD,
            securityQuestion: SECURITY_QUESTION,
            securityAnswer: SECURITY_ANSWER,
            role: "renter"
        });

        await roommate.save();
        return roommate;
    }

    roommate.firstName = roommateData.firstName;
    roommate.lastName = roommateData.lastName;
    roommate.role = "renter";

    await roommate.save();
    return roommate;
}

async function findRenterProperty(renter) {
    const property = await Property.findOne({
        "renters.renter": renter._id
    }).populate("homeowner", "firstName lastName email role");

    if (!property) {
        throw new Error(`No property was found for renter ${RENTER_EMAIL}.`);
    }

    return property;
}

async function addRoommatesToProperty(property, renter, roommates) {
    const renterItems = [
        {
            renter: renter._id,
            joinedAt: property.renters.find((item) => {
                return item.renter.toString() === renter._id.toString();
            })?.joinedAt || buildDate(2026, 1, 1)
        }
    ];

    for (const roommateData of roommates) {
        const roommate = await createOrUpdateRoommate(roommateData);

        renterItems.push({
            renter: roommate._id,
            joinedAt: roommateData.joinedAt
        });
    }

    property.renters = renterItems;
    property.renterJoinCode = "RENTER-HOME-2026";
    property.renterJoinCodeExpiresAt = buildDate(2026, 12, 31);

    await property.save();

    return Property.findById(property._id)
        .populate("homeowner", "firstName lastName email role")
        .populate("renters.renter", "firstName lastName email role");
}

async function replaceRenterBills(property, renter, roommates) {
    await Bill.deleteMany({ property: property._id });

    const allRenters = [renter, ...roommates];

    const bills = [
        { renter: allRenters[0], amount: 260, dueDate: buildDate(2026, 3, 15), category: "electricity", description: "Electricity bill for March", isUnusual: false, createdAt: buildDate(2026, 3, 2) },
        { renter: allRenters[1], amount: 120, dueDate: buildDate(2026, 3, 20), category: "water", description: "Water bill for March", isUnusual: false, createdAt: buildDate(2026, 3, 4) },
        { renter: allRenters[0], amount: 280, dueDate: buildDate(2026, 4, 15), category: "electricity", description: "Electricity bill for April", isUnusual: false, createdAt: buildDate(2026, 4, 2) },
        { renter: allRenters[1], amount: 135, dueDate: buildDate(2026, 4, 20), category: "water", description: "Water bill for April", isUnusual: false, createdAt: buildDate(2026, 4, 4) },
        { renter: allRenters[0], amount: 310, dueDate: buildDate(2026, 5, 15), category: "electricity", description: "Electricity bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 2) },
        { renter: allRenters[1], amount: 145, dueDate: buildDate(2026, 5, 20), category: "water", description: "Water bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 4) },
        {
            renter: allRenters[0],
            amount: 890,
            dueDate: buildDate(2026, 6, 15),
            category: "electricity",
            description: "Electricity bill for June",
            isUnusual: true,
            anomalyReason: "This electricity bill is significantly higher than previous electricity bills.",
            createdAt: buildDate(2026, 6, 2)
        },
        {
            renter: allRenters[1],
            amount: 420,
            dueDate: buildDate(2026, 6, 25),
            category: "maintenance",
            description: "Additional repair expense",
            isUnusual: true,
            anomalyReason: "This maintenance bill is high compared to regular apartment expenses.",
            createdAt: buildDate(2026, 6, 8)
        },
        { renter: allRenters[0], amount: 129, dueDate: buildDate(2026, 6, 28), category: "internet", description: "Internet bill for June", isUnusual: false, createdAt: buildDate(2026, 6, 6) }
    ];

    await Bill.insertMany(
        bills.map((bill) => {
            return {
                property: property._id,
                createdByRenter: bill.renter._id,
                amount: bill.amount,
                dueDate: bill.dueDate,
                category: bill.category,
                description: bill.description,
                isUnusual: bill.isUnusual,
                anomalyReason: bill.anomalyReason || "",
                createdAt: bill.createdAt,
                updatedAt: bill.createdAt
            };
        })
    );
}

async function replaceRenterIssues(property, renter, homeowner) {
    await Issue.deleteMany({
        property: property._id,
        createdByRenter: renter._id
    });

    const renterName = `${renter.firstName} ${renter.lastName}`;
    const homeownerName = `${homeowner.firstName} ${homeowner.lastName}`;

    const issues = [
        {
            title: "Air Conditioner Not Cooling",
            description: "The air conditioner is working but does not cool the living room properly.",
            status: "open",
            category: "maintenance",
            priority: "medium",
            aiSummary: "Maintenance issue detected based on the issue description.",
            createdAt: buildDate(2026, 4, 7),
            updatedAt: buildDate(2026, 4, 7),
            messages: [
                { senderRole: "renter", senderName: renterName, text: "The air conditioner has not been cooling well for the last few days.", createdAt: buildDate(2026, 4, 7) }
            ]
        },
        {
            title: "Kitchen Sink Leak",
            description: "There is a water leak under the kitchen sink.",
            status: "in_progress",
            category: "plumbing",
            priority: "high",
            aiSummary: "High priority plumbing issue detected based on the issue description.",
            createdAt: buildDate(2026, 4, 19),
            updatedAt: buildDate(2026, 4, 20),
            messages: [
                { senderRole: "renter", senderName: renterName, text: "Water is leaking under the kitchen sink and needs repair.", createdAt: buildDate(2026, 4, 19) },
                { senderRole: "homeowner", senderName: homeownerName, text: "Thanks for the update. I will arrange maintenance.", createdAt: buildDate(2026, 4, 20) }
            ]
        },
        {
            title: "Bathroom Light Not Working",
            description: "The bathroom light stopped working and needs to be checked.",
            status: "closed",
            category: "electricity",
            priority: "medium",
            aiSummary: "Electricity issue detected based on the issue description.",
            createdAt: buildDate(2026, 5, 3),
            updatedAt: buildDate(2026, 5, 5),
            messages: [
                { senderRole: "renter", senderName: renterName, text: "The bathroom light is not working since yesterday.", createdAt: buildDate(2026, 5, 3) },
                { senderRole: "homeowner", senderName: homeownerName, text: "The electrician checked it and replaced the light fixture.", createdAt: buildDate(2026, 5, 5) }
            ]
        },
        {
            title: "Window Handle Broken",
            description: "The window handle in the bedroom is broken and the window does not close properly.",
            status: "open",
            category: "maintenance",
            priority: "low",
            aiSummary: "Low priority maintenance issue detected.",
            createdAt: buildDate(2026, 5, 18),
            updatedAt: buildDate(2026, 5, 18),
            messages: [
                { senderRole: "renter", senderName: renterName, text: "The bedroom window handle is broken.", createdAt: buildDate(2026, 5, 18) }
            ]
        },
        {
            title: "Water Pressure Problem",
            description: "The water pressure in the shower is very weak.",
            status: "in_progress",
            category: "plumbing",
            priority: "medium",
            aiSummary: "Plumbing issue detected based on the issue description.",
            createdAt: buildDate(2026, 6, 2),
            updatedAt: buildDate(2026, 6, 3),
            messages: [
                { senderRole: "renter", senderName: renterName, text: "The shower water pressure has been very weak this week.", createdAt: buildDate(2026, 6, 2) },
                { senderRole: "homeowner", senderName: homeownerName, text: "I will check if a plumber is needed.", createdAt: buildDate(2026, 6, 3) }
            ]
        },
        {
            title: "Power Outlet Issue",
            description: "One of the power outlets in the kitchen is not working.",
            status: "open",
            category: "electricity",
            priority: "high",
            aiSummary: "High priority electricity issue detected based on the issue description.",
            createdAt: buildDate(2026, 6, 12),
            updatedAt: buildDate(2026, 6, 12),
            messages: [
                { senderRole: "renter", senderName: renterName, text: "The kitchen power outlet stopped working and I am not sure if it is safe.", createdAt: buildDate(2026, 6, 12) }
            ]
        }
    ];

    const docs = issues.map((issue) => {
        return {
            property: property._id,
            title: issue.title,
            description: issue.description,
            imageUrl: "",
            status: issue.status,
            category: issue.category,
            priority: issue.priority,
            aiSummary: issue.aiSummary,
            createdByRenter: renter._id,
            createdByRenterName: renterName,
            messages: issue.messages,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt
        };
    });

    await Issue.insertMany(docs);

    return Issue.find({
        property: property._id,
        createdByRenter: renter._id
    });
}

async function replaceRenterChat(property, renter, homeowner, roommates) {
    await Chat.deleteOne({ property: property._id });

    const roommate = roommates[0];
    const renterName = `${renter.firstName} ${renter.lastName}`;
    const homeownerName = `${homeowner.firstName} ${homeowner.lastName}`;
    const roommateName = `${roommate.firstName} ${roommate.lastName}`;

    const messages = [
        {
            sender: renter._id,
            senderRole: "renter",
            senderName: renterName,
            text: "Hi, the air conditioner is not cooling the living room well.",
            readBy: [{ user: homeowner._id, readAt: buildDate(2026, 4, 7) }, { user: renter._id, readAt: buildDate(2026, 4, 7) }],
            createdAt: buildDate(2026, 4, 7, 18),
            updatedAt: buildDate(2026, 4, 7, 18)
        },
        {
            sender: homeowner._id,
            senderRole: "homeowner",
            senderName: homeownerName,
            text: "Thanks for reporting it. I will check availability with a technician.",
            readBy: [{ user: homeowner._id, readAt: buildDate(2026, 4, 8) }],
            createdAt: buildDate(2026, 4, 8, 9),
            updatedAt: buildDate(2026, 4, 8, 9)
        },
        {
            sender: renter._id,
            senderRole: "renter",
            senderName: renterName,
            text: "Also, there is a leak under the kitchen sink. I opened an issue for it.",
            readBy: [{ user: renter._id, readAt: buildDate(2026, 4, 19) }],
            createdAt: buildDate(2026, 4, 19, 12),
            updatedAt: buildDate(2026, 4, 19, 12)
        },
        {
            sender: homeowner._id,
            senderRole: "homeowner",
            senderName: homeownerName,
            text: "I saw it. I will arrange maintenance and update the issue status.",
            readBy: [{ user: homeowner._id, readAt: buildDate(2026, 4, 20) }, { user: renter._id, readAt: buildDate(2026, 4, 20) }],
            createdAt: buildDate(2026, 4, 20, 10),
            updatedAt: buildDate(2026, 4, 20, 10)
        },
        {
            sender: roommate._id,
            senderRole: "renter",
            senderName: roommateName,
            text: "The electricity bill for June is much higher than usual. Can we check it?",
            readBy: [{ user: roommate._id, readAt: buildDate(2026, 6, 15) }],
            createdAt: buildDate(2026, 6, 15, 20),
            updatedAt: buildDate(2026, 6, 15, 20)
        }
    ];

    await Chat.create({
        property: property._id,
        messages,
        createdAt: buildDate(2026, 4, 7),
        updatedAt: buildDate(2026, 6, 15)
    });
}

async function replaceRenterNotifications(property, renter, homeowner, issues) {
    await Notification.deleteMany({
        property: property._id,
        recipient: renter._id
    });

    const issueOne = issues[0] || null;
    const issueTwo = issues[1] || null;

    const notifications = [
        {
            recipient: renter._id,
            sender: homeowner._id,
            property: property._id,
            issue: issueOne?._id || null,
            type: "issue_status_updated",
            title: "Issue status updated",
            message: `The status of your issue at ${property.fullAddress} was updated.`,
            isRead: false,
            createdAt: buildDate(2026, 4, 20, 10)
        },
        {
            recipient: renter._id,
            sender: homeowner._id,
            property: property._id,
            issue: issueTwo?._id || null,
            type: "issue_status_updated",
            title: "Maintenance update",
            message: `A maintenance update was added for ${property.fullAddress}.`,
            isRead: true,
            createdAt: buildDate(2026, 5, 5, 13)
        },
        {
            recipient: renter._id,
            sender: homeowner._id,
            property: property._id,
            issue: null,
            type: "payment_created",
            title: "Rent payment reminder",
            message: `A rent payment record was created for ${property.fullAddress}.`,
            isRead: false,
            createdAt: buildDate(2026, 6, 1, 9)
        },
        {
            recipient: renter._id,
            sender: homeowner._id,
            property: property._id,
            issue: null,
            type: "payment_status_updated",
            title: "Payment status updated",
            message: `Your payment status was updated for ${property.fullAddress}.`,
            isRead: false,
            createdAt: buildDate(2026, 6, 10, 17)
        }
    ];

    await Notification.insertMany(notifications);
}

async function seedRenterSampleData() {
    await connectToDatabase();

    const renter = await findRenter();
    const property = await findRenterProperty(renter);
    const homeowner = property.homeowner;

    const roommates = [
        await createOrUpdateRoommate({
            firstName: "Lior",
            lastName: "Aviv",
            email: "lior.aviv.demo@rentify.com",
            joinedAt: buildDate(2026, 2, 1)
        })
    ];

    const updatedProperty = await addRoommatesToProperty(property, renter, [
        {
            firstName: "Lior",
            lastName: "Aviv",
            email: "lior.aviv.demo@rentify.com",
            joinedAt: buildDate(2026, 2, 1)
        }
    ]);

    await replaceRenterBills(updatedProperty, renter, roommates);
    const issues = await replaceRenterIssues(updatedProperty, renter, homeowner);
    await replaceRenterChat(updatedProperty, renter, homeowner, roommates);
    await replaceRenterNotifications(updatedProperty, renter, homeowner, issues);

    console.log(`Renter found: ${renter.firstName} ${renter.lastName}`);
    console.log(`Property found: ${updatedProperty.fullAddress}`);
    console.log("Renter sample data seeded successfully.");

    await mongoose.disconnect();
}

seedRenterSampleData().catch(async (error) => {
    console.error("Failed to seed renter sample data:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});