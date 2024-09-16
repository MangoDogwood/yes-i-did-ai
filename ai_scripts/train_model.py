from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_absolute_error
import joblib

class TaskInsightModel:
    def __init__(self):
        self.completion_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.time_estimation_model = RandomForestRegressor(n_estimators=100, random_state=42)

    def train(self, X: pd.DataFrame, y_completion: pd.Series, y_time: pd.Series):
        X_train, X_test, y_completion_train, y_completion_test, y_time_train, y_time_test = train_test_split(
            X, y_completion, y_time, test_size=0.2, random_state=42
        )

        # Train completion likelihood model
        self.completion_model.fit(X_train, y_completion_train)
        completion_accuracy = accuracy_score(y_completion_test, self.completion_model.predict(X_test))

        # Train time estimation model
        self.time_estimation_model.fit(X_train, y_time_train)
        time_mae = mean_absolute_error(y_time_test, self.time_estimation_model.predict(X_test))

        print(f"Completion model accuracy: {completion_accuracy:.2f}")
        print(f"Time estimation model MAE: {time_mae:.2f} hours")

    def predict(self, X: pd.DataFrame):
        completion_likelihood = self.completion_model.predict_proba(X)[:, 1]
        estimated_time = self.time_estimation_model.predict(X)

        return completion_likelihood, estimated_time

    def save_models(self, path: str):
        joblib.dump(self.completion_model, f"{path}/completion_model.joblib")
        joblib.dump(self.time_estimation_model, f"{path}/time_estimation_model.joblib")

    def load_models(self, path: str):
        self.completion_model = joblib.load(f"{path}/completion_model.joblib")
        self.time_estimation_model = joblib.load(f"{path}/time_estimation_model.joblib")