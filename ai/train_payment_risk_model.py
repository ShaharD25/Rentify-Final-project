import pickle
from pathlib import Path

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


# This script trains a payment late-risk prediction model for Rentify.
# The model predicts whether a Renter has a high risk of late payment.


BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "rentify_payment_risk_dataset.csv"
MODELS_DIR = BASE_DIR / "models"
MODEL_FILE = MODELS_DIR / "payment_risk_model.pkl"


FEATURE_COLUMNS = [
    "monthly_rent",
    "billing_day",
    "months_in_property",
    "total_previous_payments",
    "previous_late_payments",
    "previous_unpaid_payments",
    "previous_on_time_payments",
    "average_delay_days",
    "last_payment_delay_days",
    "open_issues_count",
    "high_priority_issues_count",
    "contract_uploaded"
]

TARGET_COLUMN = "is_late"


def evaluate_model(model_name, model, x_test, y_test):
    predictions = model.predict(x_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions, zero_division=0)
    recall = recall_score(y_test, predictions, zero_division=0)
    f1 = f1_score(y_test, predictions, zero_division=0)

    print(f"\nModel: {model_name}")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, predictions, zero_division=0))

    return {
        "model_name": model_name,
        "model": model,
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }


def train_models():
    if not DATA_FILE.exists():
        raise FileNotFoundError(
            f"Dataset file was not found: {DATA_FILE}. "
            "Run generate_payment_dataset.py first."
        )

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    data = pd.read_csv(DATA_FILE)

    x = data[FEATURE_COLUMNS]
    y = data[TARGET_COLUMN]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    logistic_regression_model = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("model", LogisticRegression(max_iter=1000))
        ]
    )

    random_forest_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        random_state=42,
        class_weight="balanced"
    )

    logistic_regression_model.fit(x_train, y_train)
    random_forest_model.fit(x_train, y_train)

    logistic_results = evaluate_model(
        "Logistic Regression",
        logistic_regression_model,
        x_test,
        y_test
    )

    random_forest_results = evaluate_model(
        "Random Forest",
        random_forest_model,
        x_test,
        y_test
    )

    best_result = (
        random_forest_results
        if random_forest_results["f1"] >= logistic_results["f1"]
        else logistic_results
    )

    with open(MODEL_FILE, "wb") as model_file:
        pickle.dump(
            {
                "model": best_result["model"],
                "feature_columns": FEATURE_COLUMNS,
                "model_name": best_result["model_name"],
                "metrics": {
                    "accuracy": best_result["accuracy"],
                    "precision": best_result["precision"],
                    "recall": best_result["recall"],
                    "f1": best_result["f1"]
                }
            },
            model_file
        )

    print("\nBest model selected:")
    print(best_result["model_name"])
    print(f"Saved model to: {MODEL_FILE}")


if __name__ == "__main__":
    train_models()