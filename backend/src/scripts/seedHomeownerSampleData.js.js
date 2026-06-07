const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const User = require("../models/user");
const Property = require("../models/property.model");
const Payment = require("../models/payment.model");
const Issue = require("../models/issue.model");
const Bill = require("../models/bill.model");
const Chat = require("../models/chat.model");
const Notification = require("../models/notification.model");

/*
Seed realistic sample data for the Homeowner side.
Creates long-term usage data: properties, renters, roommates, payments,
issues, bills, chats, and notifications.
*/

const HOMEOWNER_EMAIL = "omer1234@gmail.com";
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

async function findHomeowner() {
    const homeowner = await User.findOne({
        email: HOMEOWNER_EMAIL.toLowerCase(),
        role: "homeowner"
    });

    if (!homeowner) {
        throw new Error(`Homeowner ${HOMEOWNER_EMAIL} was not found.`);
    }

    return homeowner;
}

async function createOrUpdateRenter(renterData) {
    let renter = await User.findOne({ email: renterData.email });

    if (!renter) {
        renter = new User({
            firstName: renterData.firstName,
            lastName: renterData.lastName,
            email: renterData.email,
            password: SAMPLE_PASSWORD,
            securityQuestion: SECURITY_QUESTION,
            securityAnswer: SECURITY_ANSWER,
            role: "renter"
        });

        await renter.save();
        return renter;
    }

    renter.firstName = renterData.firstName;
    renter.lastName = renterData.lastName;
    renter.role = "renter";

    await renter.save();
    return renter;
}

async function createOrUpdateProperty(homeowner, renters, propertyData) {
    let property = await Property.findOne({
        homeowner: homeowner._id,
        fullAddress: propertyData.fullAddress
    });

    const renterItems = renters.map((renterItem) => {
        return {
            renter: renterItem.user._id,
            joinedAt: renterItem.joinedAt
        };
    });

    if (!property) {
        property = new Property({
            fullAddress: propertyData.fullAddress,
            monthlyRent: propertyData.monthlyRent,
            billingDate: propertyData.billingDate,
            rentalStartDate: propertyData.rentalStartDate,
            rentalEndDate: propertyData.rentalEndDate,
            homeowner: homeowner._id,
            renters: renterItems,
            renterJoinCode: propertyData.renterJoinCode,
            renterJoinCodeExpiresAt: propertyData.renterJoinCodeExpiresAt,
            contractFileName: propertyData.contractFileName || "",
            contractFileUrl: propertyData.contractFileUrl || "",
            contractUploadedAt: propertyData.contractUploadedAt || null,
            contractUploadedBy: propertyData.contractUploadedBy || "",
            contractHistory: propertyData.contractHistory || []
        });

        await property.save();
        return property;
    }

    property.monthlyRent = propertyData.monthlyRent;
    property.billingDate = propertyData.billingDate;
    property.rentalStartDate = propertyData.rentalStartDate;
    property.rentalEndDate = propertyData.rentalEndDate;
    property.renterJoinCode = propertyData.renterJoinCode;
    property.renterJoinCodeExpiresAt = propertyData.renterJoinCodeExpiresAt;
    property.contractFileName = propertyData.contractFileName || "";
    property.contractFileUrl = propertyData.contractFileUrl || "";
    property.contractUploadedAt = propertyData.contractUploadedAt || null;
    property.contractUploadedBy = propertyData.contractUploadedBy || "";
    property.contractHistory = propertyData.contractHistory || [];

    property.renters = renterItems;

    await property.save();
    return property;
}

async function replacePayments(property, homeowner, mainRenter, renterName, rows) {
    await Payment.deleteMany({
        property: property._id,
        renter: mainRenter._id
    });

    const payments = rows.map((row) => {
        return {
            property: property._id,
            homeowner: homeowner._id,
            renter: mainRenter._id,
            renterName,
            month: row.month,
            year: row.year,
            amount: property.monthlyRent,
            dueDate: buildDate(row.year, row.month, property.billingDate, 9),
            status: row.status,
            paidAt: row.paidAt || null,
            riskFlag: row.riskFlag || false,
            riskReason: row.riskReason || ""
        };
    });

    await Payment.insertMany(payments);
}

async function replaceIssues(property, renter, renterName, issues) {
    await Issue.deleteMany({ property: property._id });

    const documents = issues.map((issue) => {
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
            messages: issue.messages || [],
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt || issue.createdAt
        };
    });

    if (documents.length > 0) {
        await Issue.insertMany(documents);
    }

    return Issue.find({ property: property._id });
}

async function replaceBills(property, renters, bills) {
    await Bill.deleteMany({ property: property._id });

    const renterByEmail = new Map();
    renters.forEach((renterItem) => {
        renterByEmail.set(renterItem.user.email, renterItem.user);
    });

    const documents = bills.map((bill) => {
        const renter = renterByEmail.get(bill.renterEmail) || renters[0].user;

        return {
            property: property._id,
            createdByRenter: renter._id,
            amount: bill.amount,
            dueDate: bill.dueDate,
            category: bill.category,
            description: bill.description,
            isUnusual: bill.isUnusual,
            anomalyReason: bill.anomalyReason || "",
            createdAt: bill.createdAt,
            updatedAt: bill.createdAt
        };
    });

    if (documents.length > 0) {
        await Bill.insertMany(documents);
    }
}

async function replaceChat(property, homeowner, renters, messages) {
    await Chat.deleteOne({ property: property._id });

    const usersByEmail = new Map();
    usersByEmail.set(homeowner.email, homeowner);

    renters.forEach((renterItem) => {
        usersByEmail.set(renterItem.user.email, renterItem.user);
    });

    const chatMessages = messages.map((message) => {
        const sender = usersByEmail.get(message.senderEmail);

        return {
            sender: sender._id,
            senderRole: message.senderRole,
            senderName: `${sender.firstName} ${sender.lastName}`,
            text: message.text,
            fileUrl: message.fileUrl || "",
            fileName: message.fileName || "",
            fileType: message.fileType || "",
            readBy: message.readByEmails.map((email) => {
                const reader = usersByEmail.get(email);

                return {
                    user: reader._id,
                    readAt: message.createdAt
                };
            }),
            createdAt: message.createdAt,
            updatedAt: message.createdAt
        };
    });

    await Chat.create({
        property: property._id,
        messages: chatMessages,
        createdAt: messages[0]?.createdAt || new Date(),
        updatedAt: messages[messages.length - 1]?.createdAt || new Date()
    });
}

async function replaceNotifications(homeowner, property, renters, issues) {
    const renterIds = renters.map((renterItem) => renterItem.user._id);

    await Notification.deleteMany({
        property: property._id,
        $or: [
            { recipient: homeowner._id },
            { recipient: { $in: renterIds } }
        ]
    });

    const mainRenter = renters[0].user;
    const secondRenter = renters[1]?.user || mainRenter;
    const firstIssue = issues[0] || null;
    const secondIssue = issues[1] || null;

    const notifications = [
        {
            recipient: homeowner._id,
            sender: mainRenter._id,
            property: property._id,
            issue: firstIssue?._id || null,
            type: "issue_created",
            title: "New issue reported",
            message: `${mainRenter.firstName} ${mainRenter.lastName} reported a new issue at ${property.fullAddress}.`,
            isRead: false,
            createdAt: buildDate(2026, 4, 19, 12)
        },
        {
            recipient: mainRenter._id,
            sender: homeowner._id,
            property: property._id,
            issue: firstIssue?._id || null,
            type: "issue_status_updated",
            title: "Issue status updated",
            message: `The status of your issue at ${property.fullAddress} was updated.`,
            isRead: true,
            createdAt: buildDate(2026, 4, 20, 10)
        },
        {
            recipient: homeowner._id,
            sender: mainRenter._id,
            property: property._id,
            issue: null,
            type: "payment_late",
            title: "Late payment detected",
            message: `${mainRenter.firstName} ${mainRenter.lastName} has a late payment for ${property.fullAddress}.`,
            isRead: false,
            createdAt: buildDate(2026, 5, 12, 9)
        },
        {
            recipient: mainRenter._id,
            sender: homeowner._id,
            property: property._id,
            issue: null,
            type: "payment_status_updated",
            title: "Payment status updated",
            message: `Your rent payment status for ${property.fullAddress} was updated.`,
            isRead: false,
            createdAt: buildDate(2026, 5, 14, 16)
        },
        {
            recipient: mainRenter._id,
            sender: homeowner._id,
            property: property._id,
            issue: null,
            type: "contract_updated",
            title: "Contract updated",
            message: `The rental contract for ${property.fullAddress} was updated.`,
            isRead: true,
            createdAt: buildDate(2026, 6, 1, 11)
        }
    ];

    if (secondIssue) {
        notifications.push({
            recipient: homeowner._id,
            sender: secondRenter._id,
            property: property._id,
            issue: secondIssue._id,
            type: "issue_created",
            title: "New maintenance issue",
            message: `${secondRenter.firstName} ${secondRenter.lastName} reported another issue at ${property.fullAddress}.`,
            isRead: false,
            createdAt: buildDate(2026, 6, 12, 14)
        });
    }

    await Notification.insertMany(notifications);
}

async function seedHomeownerSampleData() {
    await connectToDatabase();

    const homeowner = await findHomeowner();

    const scenarios = [
        {
            renters: [
                {
                    firstName: "Noa",
                    lastName: "Cohen",
                    email: "noa.cohen.demo@rentify.com",
                    joinedAt: buildDate(2025, 12, 1)
                },
                {
                    firstName: "Tal",
                    lastName: "Barak",
                    email: "tal.barak.demo@rentify.com",
                    joinedAt: buildDate(2026, 2, 3)
                }
            ],
            property: {
                fullAddress: "12 Dizengoff Street, Tel Aviv",
                renterJoinCode: "NOA-TAL-2026",
                renterJoinCodeExpiresAt: buildDate(2026, 12, 31),
                monthlyRent: 4200,
                billingDate: 10,
                rentalStartDate: buildDate(2025, 12, 1),
                rentalEndDate: buildDate(2026, 12, 1),
                contractFileName: "rental-contract-dizengoff-12.pdf",
                contractFileUrl: "/contracts/rental-contract-dizengoff-12.pdf",
                contractUploadedAt: buildDate(2025, 12, 1),
                contractUploadedBy: "Omer",
                contractHistory: [
                    {
                        fileName: "draft-contract-dizengoff-12.pdf",
                        fileUrl: "/contracts/draft-contract-dizengoff-12.pdf",
                        uploadedAt: buildDate(2025, 11, 20),
                        uploadedBy: "Omer",
                        archivedAt: buildDate(2025, 12, 1)
                    }
                ]
            },
            payments: [
                { month: 1, year: 2026, status: "paid", paidAt: buildDate(2026, 1, 10) },
                { month: 2, year: 2026, status: "paid", paidAt: buildDate(2026, 2, 10) },
                { month: 3, year: 2026, status: "paid", paidAt: buildDate(2026, 3, 10) },
                { month: 4, year: 2026, status: "paid", paidAt: buildDate(2026, 4, 10) },
                { month: 5, year: 2026, status: "paid", paidAt: buildDate(2026, 5, 10) },
                { month: 6, year: 2026, status: "paid", paidAt: buildDate(2026, 6, 10) }
            ],
            issues: [
                {
                    title: "Bedroom Window Handle",
                    description: "The bedroom window handle was loose and needed replacement.",
                    status: "closed",
                    category: "maintenance",
                    priority: "low",
                    aiSummary: "Low priority maintenance issue detected.",
                    createdAt: buildDate(2026, 3, 12),
                    updatedAt: buildDate(2026, 3, 15),
                    messages: [
                        { senderRole: "renter", senderName: "Noa Cohen", text: "The bedroom window handle is loose.", createdAt: buildDate(2026, 3, 12) },
                        { senderRole: "homeowner", senderName: "Omer", text: "Thanks, I ordered a replacement handle.", createdAt: buildDate(2026, 3, 13) }
                    ]
                }
            ],
            bills: [
                { renterEmail: "noa.cohen.demo@rentify.com", amount: 240, dueDate: buildDate(2026, 5, 15), category: "electricity", description: "Electricity bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 2) },
                { renterEmail: "tal.barak.demo@rentify.com", amount: 120, dueDate: buildDate(2026, 5, 20), category: "water", description: "Water bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 4) },
                { renterEmail: "noa.cohen.demo@rentify.com", amount: 265, dueDate: buildDate(2026, 6, 15), category: "electricity", description: "Electricity bill for June", isUnusual: false, createdAt: buildDate(2026, 6, 2) }
            ],
            chat: [
                { senderEmail: "noa.cohen.demo@rentify.com", senderRole: "renter", text: "Hi Omer, the bedroom window handle is loose. Can you check it?", readByEmails: ["omer1234@gmail.com", "noa.cohen.demo@rentify.com"], createdAt: buildDate(2026, 3, 12, 18) },
                { senderEmail: "omer1234@gmail.com", senderRole: "homeowner", text: "Thanks for letting me know. I will order a replacement part.", readByEmails: ["omer1234@gmail.com", "noa.cohen.demo@rentify.com"], createdAt: buildDate(2026, 3, 13, 9) },
                { senderEmail: "tal.barak.demo@rentify.com", senderRole: "renter", text: "The technician came today and fixed it. Thanks.", readByEmails: ["omer1234@gmail.com", "tal.barak.demo@rentify.com"], createdAt: buildDate(2026, 3, 15, 17) }
            ]
        },
        {
            renters: [
                {
                    firstName: "Amit",
                    lastName: "Levi",
                    email: "amit.levi.demo@rentify.com",
                    joinedAt: buildDate(2025, 12, 1)
                }
            ],
            property: {
                fullAddress: "8 Herzl Street, Ramat Gan",
                renterJoinCode: "AMIT-LEVI-2026",
                renterJoinCodeExpiresAt: buildDate(2026, 12, 31),
                monthlyRent: 5300,
                billingDate: 10,
                rentalStartDate: buildDate(2025, 12, 1),
                rentalEndDate: buildDate(2026, 12, 1),
                contractFileName: "rental-contract-herzl-8.pdf",
                contractFileUrl: "/contracts/rental-contract-herzl-8.pdf",
                contractUploadedAt: buildDate(2025, 12, 1),
                contractUploadedBy: "Omer"
            },
            payments: [
                { month: 1, year: 2026, status: "paid", paidAt: buildDate(2026, 1, 10) },
                { month: 2, year: 2026, status: "paid", paidAt: buildDate(2026, 2, 13) },
                { month: 3, year: 2026, status: "late", paidAt: buildDate(2026, 3, 16) },
                { month: 4, year: 2026, status: "paid", paidAt: buildDate(2026, 4, 10) },
                { month: 5, year: 2026, status: "unpaid", paidAt: null, riskFlag: true, riskReason: "One unpaid payment and previous late payment." },
                { month: 6, year: 2026, status: "paid", paidAt: buildDate(2026, 6, 14) }
            ],
            issues: [
                {
                    title: "Bathroom Plumbing Issue",
                    description: "A recurring water leak was reported in the bathroom.",
                    status: "open",
                    category: "plumbing",
                    priority: "high",
                    aiSummary: "High priority plumbing issue detected based on the issue description.",
                    createdAt: buildDate(2026, 4, 19),
                    updatedAt: buildDate(2026, 4, 20),
                    messages: [
                        { senderRole: "renter", senderName: "Amit Levi", text: "There is water under the bathroom sink again.", createdAt: buildDate(2026, 4, 19) },
                        { senderRole: "homeowner", senderName: "Omer", text: "I will contact the plumber and update you.", createdAt: buildDate(2026, 4, 20) }
                    ]
                },
                {
                    title: "Water Pressure Problem",
                    description: "The shower water pressure is weak.",
                    status: "in_progress",
                    category: "plumbing",
                    priority: "medium",
                    aiSummary: "Plumbing issue detected based on the issue description.",
                    createdAt: buildDate(2026, 6, 2),
                    updatedAt: buildDate(2026, 6, 3),
                    messages: [
                        { senderRole: "renter", senderName: "Amit Levi", text: "The shower pressure is still weak.", createdAt: buildDate(2026, 6, 2) }
                    ]
                }
            ],
            bills: [
                { renterEmail: "amit.levi.demo@rentify.com", amount: 310, dueDate: buildDate(2026, 5, 15), category: "electricity", description: "Electricity bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 2) },
                { renterEmail: "amit.levi.demo@rentify.com", amount: 135, dueDate: buildDate(2026, 5, 20), category: "water", description: "Water bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 4) },
                { renterEmail: "amit.levi.demo@rentify.com", amount: 760, dueDate: buildDate(2026, 6, 15), category: "electricity", description: "Electricity bill for June", isUnusual: true, anomalyReason: "This electricity bill is significantly higher than previous electricity bills.", createdAt: buildDate(2026, 6, 2) }
            ],
            chat: [
                { senderEmail: "amit.levi.demo@rentify.com", senderRole: "renter", text: "Hi Omer, the bathroom leak came back this morning.", readByEmails: ["omer1234@gmail.com", "amit.levi.demo@rentify.com"], createdAt: buildDate(2026, 4, 19, 8) },
                { senderEmail: "omer1234@gmail.com", senderRole: "homeowner", text: "Thanks Amit. I will call the plumber today.", readByEmails: ["omer1234@gmail.com", "amit.levi.demo@rentify.com"], createdAt: buildDate(2026, 4, 19, 9) },
                { senderEmail: "amit.levi.demo@rentify.com", senderRole: "renter", text: "Also, the electricity bill this month looks much higher than usual.", readByEmails: ["amit.levi.demo@rentify.com"], createdAt: buildDate(2026, 6, 15, 20) }
            ]
        },
        {
            renters: [
                {
                    firstName: "Eyal",
                    lastName: "Mizrahi",
                    email: "eyal.mizrahi.demo@rentify.com",
                    joinedAt: buildDate(2025, 12, 1)
                },
                {
                    firstName: "Shani",
                    lastName: "Mor",
                    email: "shani.mor.demo@rentify.com",
                    joinedAt: buildDate(2026, 1, 10)
                }
            ],
            property: {
                fullAddress: "24 Rogozin Street, Ashdod",
                renterJoinCode: "EYAL-SHANI-2026",
                renterJoinCodeExpiresAt: buildDate(2026, 12, 31),
                monthlyRent: 6800,
                billingDate: 5,
                rentalStartDate: buildDate(2025, 12, 1),
                rentalEndDate: buildDate(2026, 12, 1),
                contractFileName: "",
                contractFileUrl: "",
                contractUploadedAt: null,
                contractUploadedBy: ""
            },
            payments: [
                { month: 1, year: 2026, status: "late", paidAt: buildDate(2026, 1, 17), riskFlag: true, riskReason: "Late payment." },
                { month: 2, year: 2026, status: "late", paidAt: buildDate(2026, 2, 18), riskFlag: true, riskReason: "Repeated late payment." },
                { month: 3, year: 2026, status: "unpaid", paidAt: null, riskFlag: true, riskReason: "Unpaid payment." },
                { month: 4, year: 2026, status: "late", paidAt: buildDate(2026, 4, 20), riskFlag: true, riskReason: "High delay days." },
                { month: 5, year: 2026, status: "unpaid", paidAt: null, riskFlag: true, riskReason: "Unpaid payment and missing contract." },
                { month: 6, year: 2026, status: "late", paidAt: buildDate(2026, 6, 19), riskFlag: true, riskReason: "Repeated late pattern." }
            ],
            issues: [
                {
                    title: "Electricity Failure",
                    description: "Electricity failures were reported several times this month.",
                    status: "open",
                    category: "electricity",
                    priority: "high",
                    aiSummary: "Repeated high priority electricity issue detected.",
                    createdAt: buildDate(2026, 5, 22),
                    updatedAt: buildDate(2026, 5, 22),
                    messages: [
                        { senderRole: "renter", senderName: "Eyal Mizrahi", text: "The electricity keeps going down in the kitchen.", createdAt: buildDate(2026, 5, 22) }
                    ]
                },
                {
                    title: "Broken Door Lock",
                    description: "A broken door lock still requires repair.",
                    status: "in_progress",
                    category: "maintenance",
                    priority: "high",
                    aiSummary: "Open high priority maintenance issue may increase payment risk.",
                    createdAt: buildDate(2026, 6, 4),
                    updatedAt: buildDate(2026, 6, 5),
                    messages: [
                        { senderRole: "renter", senderName: "Shani Mor", text: "The main door lock is not closing properly.", createdAt: buildDate(2026, 6, 4) },
                        { senderRole: "homeowner", senderName: "Omer", text: "I scheduled a locksmith for tomorrow.", createdAt: buildDate(2026, 6, 5) }
                    ]
                },
                {
                    title: "Kitchen Power Outlet Issue",
                    description: "One of the kitchen power outlets is not working.",
                    status: "open",
                    category: "electricity",
                    priority: "high",
                    aiSummary: "High priority electricity issue detected.",
                    createdAt: buildDate(2026, 6, 12),
                    updatedAt: buildDate(2026, 6, 12),
                    messages: [
                        { senderRole: "renter", senderName: "Eyal Mizrahi", text: "One kitchen power outlet stopped working and may be unsafe.", createdAt: buildDate(2026, 6, 12) }
                    ]
                }
            ],
            bills: [
                { renterEmail: "eyal.mizrahi.demo@rentify.com", amount: 380, dueDate: buildDate(2026, 5, 15), category: "electricity", description: "Electricity bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 2) },
                { renterEmail: "shani.mor.demo@rentify.com", amount: 170, dueDate: buildDate(2026, 5, 20), category: "water", description: "Water bill for May", isUnusual: false, createdAt: buildDate(2026, 5, 3) },
                { renterEmail: "eyal.mizrahi.demo@rentify.com", amount: 920, dueDate: buildDate(2026, 6, 15), category: "electricity", description: "Electricity bill for June", isUnusual: true, anomalyReason: "This electricity bill is unusually high compared to previous electricity bills.", createdAt: buildDate(2026, 6, 2) },
                { renterEmail: "shani.mor.demo@rentify.com", amount: 480, dueDate: buildDate(2026, 6, 25), category: "maintenance", description: "Additional repair expense", isUnusual: true, anomalyReason: "This maintenance bill is high due to repeated repair issues.", createdAt: buildDate(2026, 6, 9) }
            ],
            chat: [
                { senderEmail: "eyal.mizrahi.demo@rentify.com", senderRole: "renter", text: "Hi Omer, we had another electricity failure this morning.", readByEmails: ["omer1234@gmail.com", "eyal.mizrahi.demo@rentify.com"], createdAt: buildDate(2026, 5, 22, 8) },
                { senderEmail: "omer1234@gmail.com", senderRole: "homeowner", text: "Please avoid using the kitchen outlet until an electrician checks it.", readByEmails: ["omer1234@gmail.com", "eyal.mizrahi.demo@rentify.com"], createdAt: buildDate(2026, 5, 22, 9) },
                { senderEmail: "shani.mor.demo@rentify.com", senderRole: "renter", text: "The front door lock is still not closing well.", readByEmails: ["shani.mor.demo@rentify.com"], createdAt: buildDate(2026, 6, 4, 19) },
                { senderEmail: "omer1234@gmail.com", senderRole: "homeowner", text: "I scheduled a locksmith. Please update me after the visit.", readByEmails: ["omer1234@gmail.com"], createdAt: buildDate(2026, 6, 5, 10) }
            ]
        }
    ];

    for (const scenario of scenarios) {
        const renters = [];

        for (const renterData of scenario.renters) {
            const renter = await createOrUpdateRenter(renterData);
            renters.push({
                user: renter,
                joinedAt: renterData.joinedAt
            });
        }

        const mainRenter = renters[0].user;
        const mainRenterName = `${mainRenter.firstName} ${mainRenter.lastName}`;

        const property = await createOrUpdateProperty(homeowner, renters, scenario.property);

        await replacePayments(property, homeowner, mainRenter, mainRenterName, scenario.payments);
        const issues = await replaceIssues(property, mainRenter, mainRenterName, scenario.issues);
        await replaceBills(property, renters, scenario.bills);
        await replaceChat(property, homeowner, renters, scenario.chat);
        await replaceNotifications(homeowner, property, renters, issues);

        console.log(`Seeded homeowner property: ${property.fullAddress}`);
    }

    console.log("Homeowner sample data seeded successfully.");
    await mongoose.disconnect();
}

seedHomeownerSampleData().catch(async (error) => {
    console.error("Failed to seed homeowner sample data:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});