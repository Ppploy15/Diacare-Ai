import pandas as pd
import xgboost as xgb
import numpy as np
import os
import joblib
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from imblearn.over_sampling import SMOTE
from imblearn.combine import SMOTEENN

def load_data(train_path, valid_path, test_path):
    """
    โหลดข้อมูลจากไฟล์ CSV
    """
    # โหลดข้อมูล
    train_data = pd.read_csv('D:/Study/SWU/year3/AI system/diabet project/train_data.csv')
    valid_data = pd.read_csv('D:/Study/SWU/year3/AI system/diabet project/validation_data.csv')
    test_data = pd.read_csv('D:/Study/SWU/year3/AI system/diabet project/test_data.csv')
    
    # แยกคอลัมน์เป้าหมาย (target) จากคอลัมน์ feature
    # สมมติว่าคอลัมน์สุดท้ายคือ target
    X_train = train_data.iloc[:, :-1]
    y_train = train_data.iloc[:, -1]
    
    X_valid = valid_data.iloc[:, :-1]
    y_valid = valid_data.iloc[:, -1]
    
    X_test = test_data.iloc[:, :-1]
    y_test = test_data.iloc[:, -1]
    
    print(f"Train data shape: {X_train.shape}, Target distribution: {y_train.value_counts()}")
    print(f"Validation data shape: {X_valid.shape}, Target distribution: {y_valid.value_counts()}")
    print(f"Test data shape: {X_test.shape}, Target distribution: {y_test.value_counts()}")
    
    return X_train, y_train, X_valid, y_valid, X_test, y_test

def preprocess_data_with_smote(X_train, y_train, X_valid, X_test):
    """
    ทำการ preprocess ข้อมูลโดยใช้ SMOTE
    """
    # SMOTE
    smoteenn = SMOTEENN(random_state=42)
    X_train_balanced, y_train_balanced = smoteenn.fit_resample(X_train, y_train)
    
    print(f"Original train shape: {X_train.shape}, Balanced train shape: {X_train_balanced.shape}")
    print(f"Original class distribution: {pd.Series(y_train).value_counts()}")
    print(f"Balanced class distribution: {pd.Series(y_train_balanced).value_counts()}")
    
    return X_train_balanced, y_train_balanced, X_valid, X_test

def evaluate_model(model, X, y, dataset_name):
    """
    ประเมินโมเดลโดยใช้หลายเมตริก
    """
    # ทำนายผลลัพธ์
    y_pred = model.predict(X)
    y_pred_proba = model.predict_proba(X)[:, 1]
    
    # คำนวณเมตริกต่างๆ
    accuracy = accuracy_score(y, y_pred)
    tn, fp, fn, tp = confusion_matrix(y, y_pred).ravel()
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    try:
        auc = roc_auc_score(y, y_pred_proba)
    except:
        auc = 0
        
    # พิมพ์ผลลัพธ์
    print(f"\n{dataset_name} Metrics:")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    print(f"AUC: {auc:.4f}")
    print(f"Confusion Matrix:\n{confusion_matrix(y, y_pred)}")
    print(f"Classification Report:\n{classification_report(y, y_pred)}")
    
    metrics = {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'auc': auc,
        'tp': tp,
        'tn': tn,
        'fp': fp,
        'fn': fn
    }
    
    return metrics

def train_balanced_model(X_train, y_train):
    # ปรับ scale_pos_weight ให้น้อยลงเพื่อเพิ่ม precision
    neg_samples = np.sum(y_train == 0)
    pos_samples = np.sum(y_train == 1)
    scale_pos_weight = (neg_samples / pos_samples) * 1.2  # ลดลงจาก 1.5
    
    model = xgb.XGBClassifier(
        objective='binary:logistic',
        random_state=42,
        n_estimators=1000,
        eval_metric=['auc', 'logloss', 'error'],
        use_label_encoder=False,
        scale_pos_weight=scale_pos_weight,
        max_delta_step=3,        # Increased from 1
        learning_rate=0.01,
        max_depth=5,             # Reduced slightly to prevent overfitting
        min_child_weight=7,      # Increased from 5
        gamma=0.5,               # Increased from 0.3
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.4            # Added L1 regularization   
    )
    
    return model

def manual_hyperparameter_search_balanced(X_train_balanced, y_train_balanced, X_valid_scaled, y_valid):
    param_grid = {
        'max_depth': [4, 5, 6, 7],
        'learning_rate': [0.01, 0.02, 0.03, 0.05],
        'n_estimators': [200, 300, 400, 500],
        'min_child_weight': [5, 7, 9],  # เพิ่มค่าให้สูงขึ้นเพื่อลด overfitting และเพิ่ม precision
        'gamma': [0.3, 0.5, 0.7, 1.0],  # เพิ่มค่าให้สูงขึ้นเพื่อเพิ่ม precision
        'subsample': [0.7, 0.8, 0.9],
        'colsample_bytree': [0.7, 0.8, 0.9],
        'scale_pos_weight': [0.8, 1.0, 1.2],  # ลดค่าลงเพื่อเพิ่ม precision
        'max_delta_step': [3, 5, 7],  # เพิ่มค่าให้สูงขึ้น
        'reg_alpha': [0.1, 0.3, 0.5],  # เพิ่ม L1 regularization
        'reg_lambda': [0.1, 1.0, 5.0]  # เพิ่ม L2 regularization
    }
    
    def custom_scorer(y_true, y_pred):
        tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        # ปรับสัดส่วน recall:precision เป็น 60:40
        return (0.6 * recall) + (0.4 * precision)
    
    n_iter = 30
    best_score = float('-inf')
    best_params = None
    best_model = None
    
    for i in range(n_iter):
        params = {
            key: np.random.choice(values) 
            for key, values in param_grid.items()
        }
        
        model = xgb.XGBClassifier(
            objective='binary:logistic',
            random_state=42,
            use_label_encoder=False,
            **params
        )
        
        model.fit(
            X_train_balanced,
            y_train_balanced,
            eval_set=[(X_valid_scaled, y_valid)],
            verbose=False
        )
        
        y_pred = model.predict(X_valid_scaled)
        score = custom_scorer(y_valid, y_pred)
        
        tn, fp, fn, tp = confusion_matrix(y_valid, y_pred).ravel()
        recall = tp / (tp + fn)
        precision = tp / (tp + fp)
        
        print(f"\nIteration {i+1}/{n_iter}")
        print(f"Parameters: {params}")
        print(f"Recall: {recall:.4f}, Precision: {precision:.4f}")
        print(f"Custom score (0.6*recall + 0.4*precision): {score:.4f}")
        
        if score > best_score:
            best_score = score
            best_params = params
            best_model = model
            print("New best model found!")
            
        if best_params:
            converted_params = {}
            for key, value in best_params.items():
                if hasattr(value, 'item'):
                    converted_params[key] = value.item()
                else:
                    converted_params[key] = value
            best_params = converted_params
        
        return best_model, best_params

def save_model(model, model_name, metrics=None):
    """
    บันทึกโมเดลและข้อมูลประสิทธิภาพ
    """
    # สร้างโฟลเดอร์ models ถ้ายังไม่มี
    if not os.path.exists('models'):
        os.makedirs('models')
    
    # เพิ่มวันที่และเวลาในชื่อไฟล์
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # บันทึกโมเดล
    model_path = f"models/{model_name}_{timestamp}.pkl"
    joblib.dump(model, model_path)
    print(f"บันทึกโมเดลไปที่: {model_path}")
    
    # บันทึกเมตริกลงในไฟล์แยกถ้ามี
    if metrics:
        # แปลง NumPy types เป็น Python types
        converted_metrics = {}
        for key, value in metrics.items():
            if hasattr(value, 'item'):  # เช็คว่าเป็น NumPy type หรือไม่
                converted_metrics[key] = value.item()  # แปลงเป็น Python type
            else:
                converted_metrics[key] = value
                
        metrics_path = f"models/{model_name}_metrics_{timestamp}.json"
        with open(metrics_path, 'w') as f:
            import json
            json.dump(converted_metrics, f, indent=4)
        print(f"บันทึกเมตริกไปที่: {metrics_path}")
    
    return model_path

def save_feature_importance(model, feature_names, model_name):
    """
    บันทึกความสำคัญของ feature
    """
    # สร้างโฟลเดอร์ models ถ้ายังไม่มี
    if not os.path.exists('models'):
        os.makedirs('models')
    
    # เพิ่มวันที่และเวลาในชื่อไฟล์
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # สร้าง DataFrame ความสำคัญของ feature
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    # บันทึกเป็น CSV
    importance_path = f"models/{model_name}_feature_importance_{timestamp}.csv"
    feature_importance.to_csv(importance_path, index=False)
    print(f"บันทึกความสำคัญของ feature ไปที่: {importance_path}")
    
    return importance_path

if __name__ == "__main__":
    try:
        # กำหนดเส้นทางไฟล์
        train_path = 'D:/Study/SWU/year3/AI system/diabet project/training_data.csv'
        valid_path = 'D:/Study/SWU/year3/AI system/diabet project/validation_data.csv' 
        test_path = 'D:/Study/SWU/year3/AI system/diabet project/test_data.csv'
        
        # โหลดข้อมูล
        print("โหลดข้อมูล...")
        X_train, y_train, X_valid, y_valid, X_test, y_test = load_data(train_path, valid_path, test_path)
        
        # Preprocess data with SMOTE
        print("\nPreprocessing data with SMOTE...")
        X_train_balanced, y_train_balanced, X_valid_scaled, X_test_scaled = \
            preprocess_data_with_smote(X_train, y_train, X_valid, X_test)
        
        # Train balanced model
        print("\nTraining balanced model...")
        balanced_model = train_balanced_model(X_train, y_train)
        balanced_model.fit(
            X_train_balanced, 
            y_train_balanced,
            eval_set=[(X_valid_scaled, y_valid)],
            verbose=True
        )
        
        # Evaluate balanced model
        print("\nEvaluating balanced model:")
        balanced_metrics = evaluate_model(balanced_model, X_valid_scaled, y_valid, "Validation")
        
        # บันทึกโมเดลที่เทรนเสร็จแล้ว
        save_model(balanced_model, "xgboost_balanced", balanced_metrics)
        save_feature_importance(balanced_model, X_train.columns, "xgboost_balanced")

        # Tune hyperparameters for better balance
        print("\nTuning hyperparameters...")
        best_model, best_params = manual_hyperparameter_search_balanced(
            X_train_balanced, y_train_balanced, X_valid_scaled, y_valid
        )
        print("\nBest parameters:", best_params)

        # Evaluate final model
        print("\nEvaluating final model:")
        final_metrics = evaluate_model(best_model, X_test_scaled, y_test, "Test")
        
        # บันทึกโมเดลที่ดีที่สุดและเมตริก
        save_model(best_model, "xgboost_best", final_metrics)
        save_feature_importance(best_model, X_train.columns, "xgboost_best")
        
        # บันทึกพารามิเตอร์ที่ดีที่สุด
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        params_path = f"models/best_params_{timestamp}.json"

        # แปลง NumPy types เป็น Python types
        converted_params = {}
        for key, value in best_params.items():
            if hasattr(value, 'item'):  # เช็คว่าเป็น NumPy type หรือไม่
                converted_params[key] = value.item()  # แปลงเป็น Python type
            else:
                converted_params[key] = value

        with open(params_path, 'w') as f:
            import json
            json.dump(converted_params, f, indent=4)
        print(f"บันทึกพารามิเตอร์ที่ดีที่สุดไปที่: {params_path}")
                
        print("\nการทำงานเสร็จสมบูรณ์!")
        
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        raise