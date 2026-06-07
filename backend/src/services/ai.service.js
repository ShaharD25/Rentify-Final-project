/*
AI service for communicating with the Rentify Python Flask AI API.
This service connects the Node.js backend to the trained AI models.
*/

const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "http://127.0.0.1:5050";

/*
Classify a natural language assistant question into an intent.
*/
async function classifyIntent(question) {
    const response = await fetch(`${AI_API_BASE_URL}/classify-intent`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
    });

    const data = await response.json();
    return data;
}

/*
Predict payment risk using the trained Python model.
*/
async function predictPaymentRisk(paymentRiskData) {
    const response = await fetch(`${AI_API_BASE_URL}/predict-payment-risk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentRiskData)
    });

    const data = await response.json();
    return data;
}

module.exports = {
    classifyIntent,
    predictPaymentRisk
};