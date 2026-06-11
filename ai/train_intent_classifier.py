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
    ("which renter might pay late next month", "payment_risk"),
    ("who is most likely to miss the next payment", "payment_risk"),
    ("show me renters with possible late rent", "payment_risk"),
    ("which renters should I watch for payment risk", "payment_risk"),
    ("who has the highest chance of paying late", "payment_risk"),
    ("detect possible rent delays", "payment_risk"),
    ("show renters that may become late", "payment_risk"),
    ("which renter has a risky payment history", "payment_risk"),
    ("show me future late payment risks", "payment_risk"),
    ("who might not pay rent on time", "payment_risk"),

    # Payments summary intent
    ("which renter is paying the highest sum of money", "payments_summary"),
    ("which renter pays the most money", "payments_summary"),
    ("who pays the highest rent", "payments_summary"),
    ("show me the highest paying renter", "payments_summary"),
    ("which property has the highest rent", "payments_summary"),
    ("who has the largest monthly payment", "payments_summary"),
    ("show me the biggest rent payment", "payments_summary"),
    ("which renter pays the largest amount", "payments_summary"),
    ("who pays the most each month", "payments_summary"),
    ("show the top rent amount", "payments_summary"),
    ("which rent payment is the highest", "payments_summary"),
    ("show me monthly rent income", "payments_summary"),
    ("how much money do I get this month", "payments_summary"),
    ("show me rent money summary", "payments_summary"),
    ("which renter has unpaid rent", "payments_summary"),
    ("show me all unpaid payments", "payments_summary"),
    ("show me all paid payments", "payments_summary"),
    ("show me all late payments", "payments_summary"),

    # Issues summary intent
    ("show me all open issues", "issues_summary"),
    ("which renter opened an issue", "issues_summary"),
    ("show current apartment issues", "issues_summary"),
    ("what problems are currently open", "issues_summary"),
    ("show me active maintenance requests", "issues_summary"),
    ("which issues need treatment", "issues_summary"),
    ("show unresolved issues", "issues_summary"),
    ("what issues are still not closed", "issues_summary"),
    ("show me issue status", "issues_summary"),
    ("show all problems reported by renters", "issues_summary"),

    # Recurring issues intent
    ("which issue category appears the most", "recurring_issues"),
    ("what kind of problems happen most often", "recurring_issues"),
    ("show me repeated apartment issues", "recurring_issues"),
    ("which maintenance problem repeats itself", "recurring_issues"),
    ("show issue patterns by category", "recurring_issues"),
    ("what is the most common issue", "recurring_issues"),
    ("which properties have recurring problems", "recurring_issues"),
    ("show repeated renter complaints", "recurring_issues"),
    ("detect recurring repair requests", "recurring_issues"),
    ("show maintenance trends by issue type", "recurring_issues"),

    # Bills summary intent
    ("show me electricity bills", "bills_summary"),
    ("show electricity bills", "bills_summary"),
    ("list electricity bills", "bills_summary"),
    ("show water bills", "bills_summary"),
    ("show internet bills", "bills_summary"),
    ("show gas bills", "bills_summary"),
    ("show arnona bills", "bills_summary"),
    ("show maintenance bills", "bills_summary"),
    ("show bills by category", "bills_summary"),
    ("show me bills from electricity category", "bills_summary"),
    ("how much did I pay for electricity", "bills_summary"),
    ("how much did we pay for water", "bills_summary"),
    ("show me all apartment bills", "bills_summary"),
    ("show bill history", "bills_summary"),
    ("show bills for this apartment", "bills_summary"),
    ("show expenses by category", "bills_summary"),
    ("which bill category costs the most", "bills_summary"),
    ("show me monthly utility bills", "bills_summary"),

    # Unusual bills intent
    ("is my electricity bill too high", "unusual_bills"),
    ("is the water bill unusual", "unusual_bills"),
    ("which bill looks suspicious", "unusual_bills"),
    ("show me bills that are higher than normal", "unusual_bills"),
    ("detect expensive utility bills", "unusual_bills"),
    ("which expense is unusually high", "unusual_bills"),
    ("show bills with abnormal amount", "unusual_bills"),
    ("find unusual apartment expenses", "unusual_bills"),
    ("is there a strange bill this month", "unusual_bills"),
    ("show me bills that do not look normal", "unusual_bills"),

    # Contract info intent
    ("when does my lease end", "contract_info"),
    ("when does the rental agreement end", "contract_info"),
    ("show me lease information", "contract_info"),
    ("show me rental dates", "contract_info"),
    ("what is my contract start date", "contract_info"),
    ("what is my contract end date", "contract_info"),
    ("is there a contract file", "contract_info"),
    ("show uploaded contract file", "contract_info"),
    ("do we have a signed contract", "contract_info"),
    ("show the apartment contract status", "contract_info"),

    # General help intent
    ("what can I ask here", "general_help"),
    ("what questions do you support", "general_help"),
    ("show me examples of questions", "general_help"),
    ("what can the assistant answer", "general_help"),
    ("how should I use this assistant", "general_help"),
    ("give me question examples", "general_help"),
    ("show supported assistant topics", "general_help"),
    ("what information can you show me", "general_help"),
    ("what can you do for homeowner", "general_help"),
    ("what can you do for renter", "general_help"),
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