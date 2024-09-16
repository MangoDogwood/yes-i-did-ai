import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import List, Dict

class DataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()

    def preprocess_tasks(self, tasks: List[Dict]) -> pd.DataFrame:
        df = pd.DataFrame(tasks)
        
        # Convert dates to datetime
        df['createdAt'] = pd.to_datetime(df['createdAt'])
        df['dueDate'] = pd.to_datetime(df['dueDate'])
        
        # Calculate task duration
        df['duration'] = (df['dueDate'] - df['createdAt']).dt.total_seconds() / 3600  # in hours
        
        # One-hot encode priority
        df = pd.get_dummies(df, columns=['priority'])
        
        # Extract day of week and hour from createdAt
        df['day_of_week'] = df['createdAt'].dt.dayofweek
        df['hour_of_day'] = df['createdAt'].dt.hour
        
        # Calculate words in title and description
        df['title_word_count'] = df['title'].str.split().str.len()
        df['description_word_count'] = df['description'].str.split().str.len()
        
        # Scale numerical features
        numerical_features = ['duration', 'day_of_week', 'hour_of_day', 'title_word_count', 'description_word_count']
        df[numerical_features] = self.scaler.fit_transform(df[numerical_features])
        
        return df

    def preprocess_new_task(self, task: Dict) -> pd.DataFrame:
        return self.preprocess_tasks([task])