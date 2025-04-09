import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';  // นำเข้า auth
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore'; // นำเข้า db
import axios from 'axios';
import './Predict.css';


const Predict = () => {
  const [userName, setUserName] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionMessage, setPredictionMessage] = useState('');
  const [formData, setFormData] = useState({
    gender: '',
    age: '',
    weight: '',
    height: '',
    hypertension: false,
    heartDisease: false,
    smokingStatus: 'Never',
    hbA1c: '',
    currentBloodSugar: '',
  });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserName(docSnapshot.data().name);
        }
      });
    } else {
      setUserName(null);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
    return 0;
  };

  const handlePrediction = async () => {
    const bmi = calculateBMI(formData.weight, formData.height);
    const features = [
      parseFloat(formData.age),
      parseFloat(bmi),
      parseFloat(formData.hbA1c),
      parseFloat(formData.currentBloodSugar),
      formData.hypertension ? 1 : 0,
      formData.heartDisease ? 1 : 0,
      formData.smokingStatus === 'Current' ? 1 : 0,
      formData.smokingStatus === 'Ever' ? 1 : 0,
      formData.smokingStatus === 'Former' ? 1 : 0,
      formData.smokingStatus === 'Never' ? 1 : 0,
      formData.smokingStatus === 'Missing' ? 1 : 0,
      formData.gender === 'male' ? 1 : 0,
      formData.gender === 'female' ? 1 : 0,
    ];

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', { features });

      setPredictionResult(response.data.prediction);
      setPredictionMessage(response.data.message);

      if (userName) {
        const auth = getAuth();
        const db = getFirestore();
        const predictionCollectionRef = collection(db, 'predictionHistory');

        await addDoc(predictionCollectionRef, {
          uid: auth.currentUser.uid,
          name: userName,
          formData,
          predictionResult: response.data.prediction,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Error predicting:', error);
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <div className="predict">
      <div className="box-top">
        <div className="box-predict">
          <h2>{userName ? ` ${userName}` : 'กรุณาล็อกอิน'}</h2>
          <form>
            <div className="input-group gender-group">
              <label>
                เพศ:
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                  />
                  ชาย
              
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                หญิง

              </label>
              <label>อายุ:
              <input className="input-age" type="number" name="age" value={formData.age} onChange={handleChange} />
              </label>
            </div>



            <div className="input-group weight-height-group">
              <div>
                <label>น้ำหนัก (kg):</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
              </div>
              <div>
                <label>ส่วนสูง (cm):</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group health-group">
              <label>โรคความดันโลหิตสูง:</label>
              <input type="checkbox" name="hypertension" checked={formData.hypertension} onChange={handleChange} />
              <label>โรคหัวใจ:</label>
              <input type="checkbox" name="heartDisease" checked={formData.heartDisease} onChange={handleChange} />
            </div>

            <div className="input-group smoking-group">
              <label>ประวัติการสูบบุหรี่:</label>
              <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange}>
                <option value="Never">Never</option>
                <option value="Current">Current</option>
                <option value="Former">Former</option>
                <option value="Ever">Ever</option>
                <option value="Missing">Missing</option>
              </select>
            </div>

            <div className="input-group">
              <label>ระดับน้ำตาล HbA1c (mmol/mol):</label>
              <input className="input-sweet" type="number" name="hbA1c" value={formData.hbA1c} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label>ระดับน้ำตาลในเลือดปัจจุบัน (mmol/mol):</label>
              <input className="input-sweet" type="number" name="currentBloodSugar" value={formData.currentBloodSugar} onChange={handleChange} />
            </div>

            <button type="button" onClick={handlePrediction} className="predict-button">
              ทำนาย
            </button>
          </form>

          {predictionMessage && (
            <div className={`prediction-message ${predictionResult === 1 ? 'danger' : 'success'}`}>
              ผลทำนาย: {predictionMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predict;