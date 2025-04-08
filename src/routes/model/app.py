from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle

app = Flask(__name__)
CORS(app)

# โหลดโมเดล
with open('xgboost_best_20250312_001315.pkl', 'rb') as file:
    model = pickle.load(file)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features = data['features']

        features_array = np.array([features])
        prediction = model.predict(features_array)

        prediction_int = int(prediction[0])  # แปลงจาก numpy เป็น int ธรรมดา

        # ✅ ใส่ตรงนี้! แปลงค่า 0/1 เป็นข้อความ
        message = "มีโอกาสเป็นโรคเบาหวาน" if prediction_int == 1 else "ไม่มีโอกาสเป็นโรคเบาหวาน"

        # ✅ ส่งค่ากลับไปทั้งตัวเลขและข้อความ
        return jsonify({
            'prediction': prediction_int,
            'message': message
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
