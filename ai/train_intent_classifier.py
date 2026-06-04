import math
import pickle
import re
from collections import Counter, defaultdict
from pathlib import Path


# This script trains a simple NLP intent classifier for the Rentify Smart Assistant.
# It implements TF-IDF and Naive Bayes manually, without using external ML libraries.
# The classifier receives a natural language question and predicts the user's intent.


BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODEL_FILE = MODELS_DIR / "intent_classifier.pkl"


TRAINING_DATA = [
    # Payment risk intent
    ("which renters are likely to pay late", "payment_risk"),
    ("show me renters with high payment risk", "payment_risk"),
    ("who may be late with rent payment", "payment_risk"),
    ("predict late payment risk", "payment_risk"),
    ("which renter has risky payment behavior", "payment_risk"),
    ("show payment risk patterns", "payment_risk"),
    ("who is at risk of late payment", "payment_risk"),
    ("detect renters that may not pay on time", "payment_risk"),
    ("show risky renters", "payment_risk"),
    ("which payments may become late", "payment_risk"),

    # Payments summary intent
    ("show payment summary", "payments_summary"),
    ("how many payments are paid", "payments_summary"),
    ("which payments are unpaid", "payments_summary"),
    ("which payments are late", "payments_summary"),
    ("show me paid and unpaid payments", "payments_summary"),
    ("summarize monthly payments", "payments_summary"),
    ("show income summary", "payments_summary"),
    ("how much rent income did I receive", "payments_summary"),
    ("show payment status overview", "payments_summary"),
    ("give me payment statistics", "payments_summary"),

    # Issues summary intent
    ("show open issues", "issues_summary"),
    ("summarize my issues", "issues_summary"),
    ("how many issues are open", "issues_summary"),
    ("show maintenance requests", "issues_summary"),
    ("which issues are still open", "issues_summary"),
    ("show apartment problems", "issues_summary"),
    ("summarize maintenance status", "issues_summary"),
    ("what issues are waiting for repair", "issues_summary"),
    ("show renter issues", "issues_summary"),
    ("give me issue overview", "issues_summary"),

    # Recurring issues intent
    ("show recurring issues", "recurring_issues"),
    ("which problems happen repeatedly", "recurring_issues"),
    ("detect repeated maintenance problems", "recurring_issues"),
    ("show recurring maintenance trends", "recurring_issues"),
    ("which apartment has repeated issues", "recurring_issues"),
    ("find recurring problems", "recurring_issues"),
    ("show repeated issue categories", "recurring_issues"),
    ("what problems keep coming back", "recurring_issues"),
    ("show maintenance patterns", "recurring_issues"),
    ("detect issue trends", "recurring_issues"),

    # Bills summary intent
    ("show my bills summary", "bills_summary"),
    ("summarize apartment bills", "bills_summary"),
    ("show shared expenses", "bills_summary"),
    ("how much are my bills", "bills_summary"),
    ("show monthly bill totals", "bills_summary"),
    ("summarize water and electricity bills", "bills_summary"),
    ("show apartment expenses", "bills_summary"),
    ("what are my shared costs", "bills_summary"),
    ("show bill categories", "bills_summary"),
    ("give me bills overview", "bills_summary"),

    # Unusual bills intent
    ("are there any unusual bills", "unusual_bills"),
    ("show unusual expenses", "unusual_bills"),
    ("detect high bills", "unusual_bills"),
    ("which bill is higher than usual", "unusual_bills"),
    ("show abnormal bill amounts", "unusual_bills"),
    ("find bills that are too expensive", "unusual_bills"),
    ("show bill anomalies", "unusual_bills"),
    ("is there an unusual electricity bill", "unusual_bills"),
    ("detect unusual water bill", "unusual_bills"),
    ("which expenses are abnormal", "unusual_bills"),

    # Contract info intent
    ("when does my contract end", "contract_info"),
    ("show contract details", "contract_info"),
    ("do I have an uploaded contract", "contract_info"),
    ("show rental contract", "contract_info"),
    ("what is the contract end date", "contract_info"),
    ("show lease dates", "contract_info"),
    ("when did the rental contract start", "contract_info"),
    ("show contract information", "contract_info"),
    ("is the contract uploaded", "contract_info"),
    ("show contract status", "contract_info"),

    # General help intent
    ("what can you help me with", "general_help"),
    ("help", "general_help"),
    ("how can you help", "general_help"),
    ("what questions can I ask", "general_help"),
    ("show assistant options", "general_help"),
    ("what do you know", "general_help"),
    ("what can I ask you", "general_help"),
    ("give me help", "general_help"),
    ("assistant help", "general_help"),
    ("show available commands", "general_help"),
]


STOP_WORDS = {
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "me",
    "my", "is", "are", "be", "with", "that", "this", "do", "did", "does",
    "can", "i", "you", "what", "which", "who", "how", "any"
}


def tokenize(text):
    # Normalize and split text into meaningful words.
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    words = text.split()

    return [word for word in words if word not in STOP_WORDS]


def build_vocabulary(training_data):
    vocabulary = set()

    for question, _intent in training_data:
        tokens = tokenize(question)
        vocabulary.update(tokens)

    return sorted(vocabulary)


def calculate_idf(training_data, vocabulary):
    # IDF gives higher weight to words that appear in fewer documents.
    document_count = len(training_data)
    idf_values = {}

    for word in vocabulary:
        documents_with_word = 0

        for question, _intent in training_data:
            tokens = set(tokenize(question))

            if word in tokens:
                documents_with_word += 1

        idf_values[word] = math.log((document_count + 1) / (documents_with_word + 1)) + 1

    return idf_values


def calculate_tf(tokens):
    # TF measures how frequent each word is inside one question.
    token_counts = Counter(tokens)
    total_tokens = len(tokens)

    if total_tokens == 0:
        return {}

    return {
        word: count / total_tokens
        for word, count in token_counts.items()
    }


def vectorize_question(question, vocabulary, idf_values):
    # Convert a text question into a TF-IDF numeric vector.
    tokens = tokenize(question)
    tf_values = calculate_tf(tokens)

    vector = []

    for word in vocabulary:
        tf = tf_values.get(word, 0)
        idf = idf_values.get(word, 0)
        vector.append(tf * idf)

    return vector


def train_naive_bayes(training_data, vocabulary, idf_values):
    # Train a Gaussian Naive Bayes classifier manually on TF-IDF vectors.
    class_vectors = defaultdict(list)
    class_counts = Counter()

    for question, intent in training_data:
        vector = vectorize_question(question, vocabulary, idf_values)
        class_vectors[intent].append(vector)
        class_counts[intent] += 1

    total_samples = len(training_data)
    model_data = {}

    for intent, vectors in class_vectors.items():
        number_of_vectors = len(vectors)
        number_of_features = len(vocabulary)

        means = []
        variances = []

        for feature_index in range(number_of_features):
            feature_values = [
                vector[feature_index]
                for vector in vectors
            ]

            mean = sum(feature_values) / number_of_vectors

            variance = sum(
                (value - mean) ** 2
                for value in feature_values
            ) / number_of_vectors

            # Small smoothing value prevents division by zero.
            variance = max(variance, 1e-6)

            means.append(mean)
            variances.append(variance)

        model_data[intent] = {
            "prior": class_counts[intent] / total_samples,
            "means": means,
            "variances": variances
        }

    return model_data


def gaussian_log_probability(value, mean, variance):
    # Calculate log probability for one numeric feature.
    return -0.5 * math.log(2 * math.pi * variance) - ((value - mean) ** 2 / (2 * variance))


def predict_intent(question, classifier):
    vocabulary = classifier["vocabulary"]
    idf_values = classifier["idf_values"]
    model_data = classifier["model_data"]

    vector = vectorize_question(question, vocabulary, idf_values)

    best_intent = None
    best_score = float("-inf")
    intent_scores = {}

    for intent, data in model_data.items():
        score = math.log(data["prior"])

        for index, value in enumerate(vector):
            score += gaussian_log_probability(
                value,
                data["means"][index],
                data["variances"][index]
            )

        intent_scores[intent] = score

        if score > best_score:
            best_score = score
            best_intent = intent

    return best_intent, intent_scores


def train_intent_classifier():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    vocabulary = build_vocabulary(TRAINING_DATA)
    idf_values = calculate_idf(TRAINING_DATA, vocabulary)
    model_data = train_naive_bayes(TRAINING_DATA, vocabulary, idf_values)

    classifier = {
        "vocabulary": vocabulary,
        "idf_values": idf_values,
        "model_data": model_data,
        "intents": sorted(set(intent for _question, intent in TRAINING_DATA))
    }

    with open(MODEL_FILE, "wb") as model_file:
        pickle.dump(classifier, model_file)

    print("Intent classifier trained successfully.")
    print(f"Number of training examples: {len(TRAINING_DATA)}")
    print(f"Vocabulary size: {len(vocabulary)}")
    print(f"Saved model to: {MODEL_FILE}")

    test_questions = [
        "Which renters may pay late next month?",
        "Are there any unusual bills?",
        "Show me all open maintenance issues",
        "Which apartments have repeated problems?",
        "How much income did I receive?",
        "When does the contract end?",
        "What can you help me with?"
    ]

    print("\nTest predictions:")

    for question in test_questions:
        predicted_intent, _scores = predict_intent(question, classifier)

        print("\n-----------------------------")
        print(f"Question: {question}")
        print(f"Predicted intent: {predicted_intent}")


if __name__ == "__main__":
    train_intent_classifier()