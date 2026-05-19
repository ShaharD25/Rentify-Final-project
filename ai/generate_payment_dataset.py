import csv
import random
from pathlib import Path

# This script generates synthetic payment behavior data for Rentify.
# Each row represents one monthly rent payment record for one Renter in one Property.
# The target column is is_late: 1 means late payment risk, 0 means low late payment risk.

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = DATA_DIR / "rentify_payment_risk_dataset.csv"


def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def generate_single_record():
    # Property-related values.
    monthly_rent = random.randint(3000, 7000)
    billing_day = random.randint(1, 28)

    # Renter history in this property.
    months_in_property = random.randint(1, 48)
    total_previous_payments = max(0, months_in_property - 1)

    previous_late_payments = random.randint(0, min(total_previous_payments, 7))
    previous_unpaid_payments = random.randint(
        0,
        min(total_previous_payments - previous_late_payments, 3)
    )

    previous_on_time_payments = (
        total_previous_payments
        - previous_late_payments
        - previous_unpaid_payments
    )

    # Delay behavior.
    if previous_late_payments == 0:
        average_delay_days = round(random.uniform(0, 1.5), 2)
        last_payment_delay_days = random.choice([0, 0, 0, 1])
    else:
        average_delay_days = round(random.uniform(1, 12), 2)
        last_payment_delay_days = random.randint(0, 20)

    # Apartment condition signals from the Issues module.
    open_issues_count = random.randint(0, 5)
    high_priority_issues_count = random.randint(0, min(open_issues_count, 3))

    # Contract signal from the Contracts module.
    contract_uploaded = random.choice([0, 1, 1, 1])

    # Synthetic risk logic.
    # This is not the trained model. This only creates realistic training labels.
    risk_score = 0.10

    risk_score += previous_late_payments * 0.075
    risk_score += previous_unpaid_payments * 0.09
    risk_score += average_delay_days * 0.025
    risk_score += last_payment_delay_days * 0.015
    risk_score += open_issues_count * 0.015
    risk_score += high_priority_issues_count * 0.05

    if previous_on_time_payments >= 6:
        risk_score -= 0.07

    if previous_on_time_payments >= 12:
        risk_score -= 0.08

    if contract_uploaded == 1:
        risk_score -= 0.04
    else:
        risk_score += 0.06

    if months_in_property <= 2:
        risk_score += 0.04

    if monthly_rent > 6000:
        risk_score += 0.035

    risk_score = clamp(risk_score, 0.02, 0.95)

    is_late = 1 if random.random() < risk_score else 0

    return {
        "monthly_rent": monthly_rent,
        "billing_day": billing_day,
        "months_in_property": months_in_property,
        "total_previous_payments": total_previous_payments,
        "previous_late_payments": previous_late_payments,
        "previous_unpaid_payments": previous_unpaid_payments,
        "previous_on_time_payments": previous_on_time_payments,
        "average_delay_days": average_delay_days,
        "last_payment_delay_days": last_payment_delay_days,
        "open_issues_count": open_issues_count,
        "high_priority_issues_count": high_priority_issues_count,
        "contract_uploaded": contract_uploaded,
        "is_late": is_late
    }


def generate_dataset(number_of_records=3000):
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    fieldnames = [
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
        "contract_uploaded",
        "is_late"
    ]

    with open(OUTPUT_FILE, mode="w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for _ in range(number_of_records):
            writer.writerow(generate_single_record())

    print(f"Dataset created successfully: {OUTPUT_FILE}")
    print(f"Number of records: {number_of_records}")


if __name__ == "__main__":
    generate_dataset(3000)