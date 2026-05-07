const express = require("express");
const router = express.Router();

const {
    generateMonthlyPayments,
    getHomeownerPayments,
    updatePaymentStatus,
    getRenterPaymentHistory,
    getIncomeAnalytics
} = require("../controllers/payment.controller");

/*
Generate monthly payments
POST /api/payments/generate
*/
router.post("/payments/generate", generateMonthlyPayments);

/*
Get all payments for one homeowner
GET /api/payments/homeowner/:homeownerId
*/
router.get("/payments/homeowner/:homeownerId", getHomeownerPayments);

/*
Update one payment status
PUT /api/payments/:paymentId/status
*/
router.put("/payments/:paymentId/status", updatePaymentStatus);

/*
Get payment history for one renter
GET /api/payments/homeowner/:homeownerId/renter/:renterName/history
*/
router.get(
    "/payments/homeowner/:homeownerId/renter/:renterName/history",
    getRenterPaymentHistory
);

/*
Get income analytics for one homeowner
GET /api/payments/homeowner/:homeownerId/analytics/income
*/
router.get(
    "/payments/homeowner/:homeownerId/analytics/income",
    getIncomeAnalytics
);

module.exports = router;