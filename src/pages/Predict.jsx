import React, { useState, useEffect } from 'react'; 
import { getAuth } from 'firebase/auth';  // นำเข้า auth
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore'; // นำเข้า db
import axios from 'axios';

const Predict = () => {
  const [userName, setUserName] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionMessage, setPredictionMessage] = useState('');
  const [formData, setFormData] = useState({
    gender: '', // แก้ไขเป็น string แทน null เพื่อให้จัดการได้ง่ายขึ้น
    age: '',
    weight: '',
    height: '',
    hypertension: false,
    heartDisease: false,
    smokingStatus: 'Never',
    hbA1c: '',
    currentBloodSugar: '',
  });

  // ฟังก์ชันดึงข้อมูลผู้ใช้จาก Firestore
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);  // สร้าง doc reference
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserName(docSnapshot.data().name);
        }
      });
    } else {
      setUserName(null);
    }
  }, []);

  // ฟังก์ชันเพื่ออัปเดตข้อมูลใน state
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ฟังก์ชันเพื่อคำนวณค่า BMI
  const calculateBMI = (weight, height) => {
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }
    return 0;
  };

  // ฟังก์ชันเพื่อทำนายและเก็บข้อมูล
  const handlePrediction = async () => {
    // คำนวณค่า BMI ก่อน
    const bmi = calculateBMI(formData.weight, formData.height);

    // สร้าง features โดยการแปลงค่าตามที่ต้องการ
    const features = [
      parseFloat(formData.age),                      // feature_0 - float
      parseFloat(bmi),                               // feature_1 - float
      parseFloat(formData.hbA1c),                    // feature_2 - float
      parseFloat(formData.currentBloodSugar),        // feature_3 - float
      formData.hypertension ? 1 : 0,                 // feature_4 - int
      formData.heartDisease ? 1 : 0,                 // feature_5 - int
      formData.smokingStatus === 'Current' ? 1 : 0,  // feature_6 - int
      formData.smokingStatus === 'Ever' ? 1 : 0,     // feature_7 - int
      formData.smokingStatus === 'Former' ? 1 : 0,   // feature_8 - int
      formData.smokingStatus === 'Never' ? 1 : 0,    // feature_9 - int
      formData.smokingStatus === 'Missing' ? 1 : 0,  // feature_10 - int
      formData.gender === 'male' ? 1 : 0,            // feature_11 - int
      formData.gender === 'female' ? 1 : 0,          // feature_12 - int
    ].map((feature) => feature === true ? 1 : (feature === false ? 0 : feature));

    // พิมพ์ข้อมูลเพื่อช่วยดีบัก
    console.log('Sending features:', features);

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', { features });

      setPredictionResult(response.data.prediction);         // เก็บค่า 0/1
      setPredictionMessage(response.data.message);           // เก็บข้อความ เช่น "มีโอกาสเป็นโรคเบาหวาน"

      // บันทึกข้อมูลใน Firebase
      if (userName) {
        const auth = getAuth();
        const db = getFirestore();
        const predictionCollectionRef = collection(db, 'predictionHistory'); // คอลเลกชันใหม่สำหรับเก็บประวัติการทำนาย

        // ใช้ addDoc เพื่อบันทึกข้อมูลใหม่ในคอลเลกชัน
        await addDoc(predictionCollectionRef, {
          uid: auth.currentUser.uid,
          name: userName,
          formData,  // ส่งข้อมูลที่กรอกทั้งหมด
          predictionResult: response.data.prediction,
          timestamp: new Date(), // เพิ่ม timestamp เพื่อให้จัดเรียงได้
        });

        console.log('ข้อมูลบันทึกแล้ว');
      }
    } catch (error) {
      console.error('Error predicting:', error);
      if (error.response) {
        console.error('Server responded with error:', error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>{userName ? `สวัสดี, ${userName}` : 'กรุณาล็อกอิน'}</h2>
      <form>
        {/* ข้อมูลที่กรอกครั้งเดียว */}
        <div>
          <label>เพศ:</label>
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleChange}
            />
            ชาย
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleChange}
            />
            หญิง
          </label>
        </div>
        <div>
          <label>อายุ:</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange} />
        </div>
        <div>
          <label>น้ำหนัก (kg):</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
        </div>
        <div>
          <label>ส่วนสูง (cm):</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange} />
        </div>
        <div>
          <label>โรคความดันโลหิตสูง:</label>
          <input type="checkbox" name="hypertension" checked={formData.hypertension} onChange={handleChange} />
        </div>
        <div>
          <label>โรคหัวใจ:</label>
          <input type="checkbox" name="heartDisease" checked={formData.heartDisease} onChange={handleChange} />
        </div>
        <div>
          <label>ประวัติการสูบบุหรี่:</label>
          <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange}>
            <option value="Never">Never</option>
            <option value="Current">Current</option>
            <option value="Former">Former</option>
            <option value="Ever">Ever</option>
            <option value="Missing">Missing</option>
          </select>
        </div>

        {/* ข้อมูลที่ต้องกรอกเพิ่ม */}
        <div>
          <label>ระดับน้ำตาล HbA1c (mmol/mol):</label>
          <input type="number" name="hbA1c" value={formData.hbA1c} onChange={handleChange} />
        </div>
        <div>
          <label>ระดับน้ำตาลในเลือดปัจจุบัน (mmol/mol):</label>
          <input type="number" name="currentBloodSugar" value={formData.currentBloodSugar} onChange={handleChange} />
        </div>

        <button type="button" onClick={handlePrediction}>ทำนาย</button>
      </form>

      {predictionMessage && (
        <div style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '18px', color: predictionResult === 1 ? 'red' : 'green' }}>
          ผลทำนาย: {predictionMessage}
        </div>
      )}
    </div>
  );
};

export default Predict;
