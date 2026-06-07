import math
import pickle
import re
from collections import Counter
from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS


# Rentify AI API.
# This Flask API exposes the trained Payment Risk model
# and the Smart Assistant Intent Classifier to the Node.js backend.


BASE_DIR = Path(__file__).resolve().parent

PAYMENT_MODEL_FILE = BASE_DIR / "models" / "payment_risk_model.pkl"
INTENT_MODEL_FILE = BASE_DIR / "models" / "intent_classifier.pkl"

app = Flask(__name__)
CORS(app)


def load_pickle_file(file_path):
    if not file_path.exists():
        raise FileNotFoundError(f"Model file was not found: {file_path}")

    with open(file_path, "rb") as file:
        return pickle.load(file)


payment_model_data = load_pickle_file(PAYMENT_MODEL_FILE)
intent_classifier = load_pickle_file(INTENT_MODEL_FILE)


def tokenize(text):
    stop_words = {
        "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "me",
        "my", "is", "are", "be", "with", "that", "this", "do", "did", "does",
        "can", "i", "you", "what", "which", "who", "how", "any"
    }

    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    words = text.split()

    return [word for word in words if word not in stop_words]


def calculate_tf(tokens):
    token_counts = Counter(tokens)
    total_tokens = len(tokens)

    if total_tokens == 0:
        return {}

    return {
        word: count / total_tokens
        for word, count in token_counts.items()
    }


def vectorize_question(question, vocabulary, idf_values):
    tokens = tokenize(question)
    tf_values = calculate_tf(tokens)

    vector = []

    for word in vocabulary:
        tf = tf_values.get(word, 0)
        idf = idf_values.get(word, 0)
        vector.append(tf * idf)

    return vector


def gaussian_log_probability(value, mean, variance):
    return -0.5 * math.log(2 * math.pi * variance) - ((value - mean) ** 2 / (2 * variance))


def classify_question_intent(question):
    vocabulary = intent_classifier["vocabulary"]
    idf_values = intent_classifier["idf_values"]
    model_data = intent_classifier["model_data"]

    vector = vectorize_question(question, vocabulary, idf_values)

    best_intent = None
    best_score = float("-inf")
    scores = {}

    for intent, data in model_data.items():
        score = math.log(data["prior"])

        for index, value in enumerate(vector):
            score += gaussian_log_probability(
                value,
                data["means"][index],
                data["variances"][index]
            )

        scores[intent] = score

        if score > best_score:
            best_score = score
            best_intent = intent

    sorted_scores = sorted(scores.values(), reverse=True)

    confidence_gap = 0

    if len(sorted_scores) >= 2:
        confidence_gap = sorted_scores[0] - sorted_scores[1]

    return {
        "intent": best_intent,
        "confidenceGap": confidence_gap
    }


def get_risk_label(probability):
    if probability >= 0.7:
        return "High Risk"

    if probability >= 0.4:
        return "Medium Risk"

    return "Low Risk"


def build_risk_reason(input_data, probability):
    reasons = []

    if input_data.get("previous_late_payments", 0) >= 2:
        reasons.append("multiple previous late payments")

    if input_data.get("previous_unpaid_payments", 0) >= 1:
        reasons.append("previous unpaid payments")

    if input_data.get("average_delay_days", 0) >= 5:
        reasons.append("high average delay days")

    if input_data.get("last_payment_delay_days", 0) >= 7:
        reasons.append("recent payment delay")

    if input_data.get("high_priority_issues_count", 0) >= 1:
        reasons.append("high priority open issues")

    if input_data.get("contract_uploaded", 1) == 0:
        reasons.append("missing uploaded contract")

    if not reasons:
        reasons.append("stable payment history")

    return f"Risk probability is {probability:.2%}. Main factors: {', '.join(reasons)}."


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "success": True,
        "message": "Rentify AI API is running.",
        "paymentModel": payment_model_data.get("model_name"),
        "intentClassifierLoaded": True
    })


@app.route("/classify-intent", methods=["POST"])
def classify_intent():
    data = request.get_json() or {}
    question = data.get("question", "")

    if not question.strip():
        return jsonify({
            "success": False,
            "message": "Question is required."
        }), 400

    result = classify_question_intent(question)

    return jsonify({
        "success": True,
        "question": question,
        "intent": result["intent"],
        "confidenceGap": result["confidenceGap"]
    })


@app.route("/predict-payment-risk", methods=["POST"])
def predict_payment_risk():
    input_data = request.get_json() or {}

    model = payment_model_data["model"]
    feature_columns = payment_model_data["feature_columns"]
    model_name = payment_model_data["model_name"]

    missing_fields = [
        field
        for field in feature_columns
        if field not in input_data
    ]

    if missing_fields:
        return jsonify({
            "success": False,
            "message": "Missing required fields.",
            "missingFields": missing_fields
        }), 400

    model_input = pd.DataFrame([input_data], columns=feature_columns)

    prediction = int(model.predict(model_input)[0])

    if hasattr(model, "predict_proba"):
        risk_probability = float(model.predict_proba(model_input)[0][1])
    else:
        risk_probability = float(prediction)

    risk_label = get_risk_label(risk_probability)
    risk_reason = build_risk_reason(input_data, risk_probability)

    return jsonify({
        "success": True,
        "modelName": model_name,
        "prediction": prediction,
        "riskProbability": risk_probability,
        "riskLabel": risk_label,
        "riskReason": risk_reason
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050, debug=True)