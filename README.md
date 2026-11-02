Rentify
A full-stack rental property management platform with machine-learning-powered assistance.

Rentify is a web application designed to simplify communication and day-to-day management between homeowners and renters. It brings properties, maintenance requests, payments, utility bills, notifications, and conversations into a single role-based experience.
Key Features
- Role-based experience: Separate homeowner and renter interfaces, with account registration and authentication.
- Property management: Manage rental properties, associated renters, and rental information.
- Maintenance requests: Report issues, attach images, track their status, and exchange updates.
- Payments and bills: View and manage rental payments and apartment bills, including monthly summaries.
- Bill anomaly detection: Flag unusual bill amounts using rule-based comparison logic.
- Property conversations: Communicate through property-related chats and share files.
- Notifications: Surface relevant updates for homeowners and renters.
- Rental documents: Upload and manage contract files.
- Roommate management: Access roommate-related information and workflows.
- Smart assistant: Answer supported questions about rental data and provide contextual assistance.
Machine Learning & AI
Rentify includes a dedicated Python Flask AI service that communicates with the Node.js backend.
Late-payment risk prediction
A supervised learning workflow predicts the risk of late rent payments from structured rental and payment-history features. The training code compares Logistic Regression, Random Forest, and Gradient Boosting classifiers and selects a model based on F1 score. The Flask API exposes the trained model through /predict-payment-risk and returns a risk assessment.

Data limitation: The repository includes a dataset-generation script and generated training data. Model predictions should be treated as an educational demonstration, not a validated real-world credit or tenant-screening assessment.
Assistant intent classification
The assistant uses a trained text intent classifier to categorize supported questions. Its Python implementation includes text preprocessing, TF-IDF-style feature construction, and a Gaussian Naive Bayes classification approach. The Flask service exposes /classify-intent; the Node.js application then retrieves and formats relevant rental information.
Rule-based analysis
Separate from the trained models, backend services implement rule-based maintenance-issue analysis and bill anomaly detection. These are not presented as machine-learning models.
Technology Stack
Layer	Technologies
Frontend	React, React Router, Tailwind CSS
Backend	Node.js, Express
Database	MongoDB, Mongoose
AI service	Python, Flask, pandas, scikit-learn
File handling	Multer
Authentication	Application-level authentication, bcrypt
Web app	Progressive Web App assets and service worker
