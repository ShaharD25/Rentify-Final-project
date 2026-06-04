import pickle
from pathlib import Path

import pandas as pd


# This script tests the trained Rentify payment risk model.
# It loads the saved model and predicts payment late risk for sample Renter payment profiles.

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR / "models" / "payment_risk_model.pkl"


def load_saved_model():
    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Model file was not found: {MODEL_FILE}. "
            "Run train_payment_risk_model.py first."
        )

    with open(MODEL_FILE, "rb") as model_file:
        saved_data = pickle.load(model_file)

    return saved_data


def build_sample_cases():
    low_risk_case = {
        "monthly_rent": 4200,
        "billing_day": 10,
        "months_in_property": 18,
        "total_previous_payments": 17,
        "previous_late_payments": 0,
        "previous_unpaid_payments": 0,
        "previous_on_time_payments": 17,
        "average_delay_days": 0.2,
        "last_payment_delay_days": 0,
        "open_issues_count": 1,
        "high_priority_issues_count": 0,
        "contract_uploaded": 1
    }

    medium_risk_case = {
        "monthly_rent": 5200,
        "billing_day": 10,
        "months_in_property": 9,
        "total_previous_payments": 8,
        "previous_late_payments": 2,
        "previous_unpaid_payments": 1,
        "previous_on_time_payments": 5,
        "average_delay_days": 4.5,
        "last_payment_delay_days": 5,
        "open_issues_count": 2,
        "high_priority_issues_count": 1,
        "contract_uploaded": 1
    }

    high_risk_case = {
        "monthly_rent": 6800,
        "billing_day": 5,
        "months_in_property": 6,
        "total_previous_payments": 5,
        "previous_late_payments": 4,
        "previous_unpaid_payments": 1,
        "previous_on_time_payments": 0,
        "average_delay_days": 9.8,
        "last_payment_delay_days": 14,
        "open_issues_count": 4,
        "high_priority_issues_count": 2,
        "contract_uploaded": 0
    }

    return {
        "Low risk Renter": low_risk_case,
        "Medium risk Renter": medium_risk_case,
        "High risk Renter": high_risk_case
    }


def get_risk_label(probability):
    if probability >= 0.7:
        return "High Risk"

    if probability >= 0.4:
        return "Medium Risk"

    return "Low Risk"


def build_risk_reason(case_data, probability):
    reasons = []

    if case_data["previous_late_payments"] >= 2:
        reasons.append("multiple previous late payments")

    if case_data["previous_unpaid_payments"] >= 1:
        reasons.append("previous unpaid payments")

    if case_data["average_delay_days"] >= 5:
        reasons.append("high average delay days")

    if case_data["last_payment_delay_days"] >= 7:
        reasons.append("recent payment delay")

    if case_data["high_priority_issues_count"] >= 1:
        reasons.append("high priority open issues")

    if case_data["contract_uploaded"] == 0:
        reasons.append("missing uploaded contract")

    if not reasons:
        reasons.append("stable payment history")

    return f"Risk probability is {probability:.2%}. Main factors: {', '.join(reasons)}."


def predict_sample_cases():
    saved_data = load_saved_model()

    model = saved_data["model"]
    feature_columns = saved_data["feature_columns"]
    model_name = saved_data["model_name"]
    metrics = saved_data["metrics"]

    print("Loaded model successfully.")
    print(f"Model name: {model_name}")
    print("Saved metrics:")
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1']:.4f}")

    sample_cases = build_sample_cases()

    print("\nPayment risk predictions:")

    for case_name, case_data in sample_cases.items():
        input_data = pd.DataFrame([case_data], columns=feature_columns)

        prediction = model.predict(input_data)[0]

        if hasattr(model, "predict_proba"):
            probability = model.predict_proba(input_data)[0][1]
        else:
            probability = float(prediction)

        risk_label = get_risk_label(probability)
        risk_reason = build_risk_reason(case_data, probability)

        print("\n-----------------------------")
        print(f"Case: {case_name}")
        print(f"Prediction value: {prediction}")
        print(f"Risk label: {risk_label}")
        print(risk_reason)


if __name__ == "__main__":
    predict_sample_cases()