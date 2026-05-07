const paymentService = require("../services/payment.service");

/*
Generate monthly payment records for a homeowner.
*/
async function generateMonthlyPayments(req, res) {
    const { homeownerId, month, year } = req.body;

    if (!homeownerId || !month || !year) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id, month, and year are required."
        });
    }

    const result = await paymentService.generateMonthlyPayments(
        homeownerId,
        Number(month),
        Number(year)
    );

    return res.status(result.success ? 201 : 400).json(result);
}

/*
Get all payments for one homeowner.
*/
async function getHomeownerPayments(req, res) {
    const { homeownerId } = req.params;

    if (!homeownerId) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id is required."
        });
    }

    const result = await paymentService.getHomeownerPayments(homeownerId);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Update one payment status.
*/
async function updatePaymentStatus(req, res) {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!paymentId || !status) {
        return res.status(400).json({
            success: false,
            message: "Payment id and status are required."
        });
    }

    const result = await paymentService.updatePaymentStatus(paymentId, status);

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Get payment history for one renter.
*/
async function getRenterPaymentHistory(req, res) {
    const { homeownerId, renterName } = req.params;

    if (!homeownerId || !renterName) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id and renter name are required."
        });
    }

    const result = await paymentService.getRenterPaymentHistory(
        homeownerId,
        renterName
    );

    return res.status(result.success ? 200 : 400).json(result);
}

/*
Get monthly income analytics for one homeowner.
*/
async function getIncomeAnalytics(req, res) {
    const { homeownerId } = req.params;

    if (!homeownerId) {
        return res.status(400).json({
            success: false,
            message: "Homeowner id is required."
        });
    }

    const result = await paymentService.getIncomeAnalytics(homeownerId);

    return res.status(result.success ? 200 : 400).json(result);
}

module.exports = {
    generateMonthlyPayments,
    getHomeownerPayments,
    updatePaymentStatus,
    getRenterPaymentHistory,
    getIncomeAnalytics
};