import warnings
warnings.filterwarnings('ignore')

# Import Neccessary libraries
import numpy as np 
import pandas as pd 

# Import Visualization libraries
import matplotlib.pyplot as plt
import seaborn as sns

#Import Model
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline

#Import Sampler libraries
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.pipeline import Pipeline as imbPipeline

from imblearn.over_sampling import SMOTE
from collections import Counter


from sklearn.model_selection import train_test_split

# Set the decimal format
pd.options.display.float_format = "{:.2f}".format

df = pd.read_csv("D:\Study\SWU\year3\AI system\diabet project\CleaningData_file.csv")


# Define the preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        # Pass continuous features directly
        ('passthrough', 'passthrough', ['age', 'bmi', 'HbA1c_level', 'blood_glucose_level']),
        
        # Pass binary features directly
        ('binary_pass', 'passthrough', ['hypertension', 'heart_disease']), 
        
        # One-hot encode categorical features
        ('onehot', OneHotEncoder(drop='first', sparse_output=False), 
         ['smoking_history_current', 'smoking_history_ever', 
          'smoking_history_former', 'smoking_history_never']),
        
        # Convert Boolean columns to integers
        ('boolean_to_int', 'passthrough', ['smoking_info_missing', 'gender_Male', 'gender_Female'])
    ]
)

# Ensure Boolean columns are converted before the pipeline
df[['smoking_info_missing', 'gender_Female']] = df[['smoking_info_missing', 'gender_Female']].astype(int)
df[['hypertension', 'heart_disease']] = df[['hypertension', 'heart_disease']].astype(int)

# Convert True/False to 1/0 for all boolean columns
boolean_columns = df.select_dtypes(include=['bool']).columns
df[boolean_columns] = df[boolean_columns].astype(int)

# Move 'diabetes' column to the end
target_column = 'diabetes'
columns = [col for col in df.columns if col != target_column] + [target_column]
df = df[columns]


# Print column names, data types, and a sample of the data
print("Column Names and Data Types:")
print(df.dtypes)
print("\nSample Data:")
print(df.head())

# Convert categorical data to binary (0/1)
#categorical_columns = df.select_dtypes(include=['object', 'category']).columns
#df = pd.get_dummies(df, columns=categorical_columns, drop_first=True)

# Split data into features and target
X = df.drop(columns=['diabetes']).values
y = df['diabetes'].values

# Split data into train (80%) and remaining (20%)
X_train, X_remaining, y_train, y_remaining = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Split remaining data into validation (70%) and test (30%)
X_val, X_test, y_val, y_test = train_test_split(X_remaining, y_remaining, test_size=0.3, random_state=42, stratify=y_remaining)

# Print the shapes of the splits
print("Train set shape:", X_train.shape, y_train.shape)
print("Validation set shape:", X_val.shape, y_val.shape)
print("Test set shape:", X_test.shape, y_test.shape)

# Save the train dataset
train_data = pd.DataFrame(np.hstack([X_train, y_train.reshape(-1, 1)]))
train_data.columns = ['feature_' + str(i) for i in range(X_train.shape[1])] + ['diabetes']
train_data.to_csv('train_data.csv', index=False)

# Save the validation dataset
validation_data = pd.DataFrame(np.hstack([X_val, y_val.reshape(-1, 1)]))
validation_data.columns = ['feature_' + str(i) for i in range(X_val.shape[1])] + ['diabetes']
validation_data.to_csv('validation_data.csv', index=False)

# Save the test dataset
test_data = pd.DataFrame(np.hstack([X_test, y_test.reshape(-1, 1)]))
test_data.columns = ['feature_' + str(i) for i in range(X_test.shape[1])] + ['diabetes']
test_data.to_csv('test_data.csv', index=False)

print("Train, validation, and test datasets have been saved to CSV files.")


   