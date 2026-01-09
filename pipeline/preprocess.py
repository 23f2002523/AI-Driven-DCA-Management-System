import pandas as pd
from sklearn.preprocessing import LabelEncoder

def load_data(csv_path):
    """Load CSV data"""
    return pd.read_csv(csv_path)

def preprocess_data(df):
    """Encode categorical columns"""
    le = LabelEncoder()
    df["region_encoded"] = le.fit_transform(df["region"])
    return df

def assign_priority(prob):
    """Convert probability to priority label"""
    if prob >= 0.7:
        return "High"
    elif prob >= 0.4:
        return "Medium"
    else:
        return "Low"

def run_pipeline(csv_path):
    """
    Full preprocessing + priority assignment pipeline
    """
    df = load_data(csv_path)
    df = preprocess_data(df)

    # NOTE:
    # In production, model prediction will happen here.
    # For MVP, we assume 'recovery_probability' already exists.

    df["priority"] = df["recovery_probability"].apply(assign_priority)
    return df
