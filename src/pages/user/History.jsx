import React, { useState, useEffect } from 'react';  
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import './History.css';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const userCollection = collection(db, 'predictionHistory');

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Logged in user UID:", user?.uid); // ตรวจสอบ uid ที่เราดึงมา

      if (user) {
        console.log('✅ Logged in user:', user.uid);
        const q = query(userCollection, where('uid', '==', user.uid), orderBy('timestamp', 'desc'));

        try {
          const querySnapshot = await getDocs(q);
          console.log('✅ Total documents:', querySnapshot.size);

          const data = querySnapshot.docs.map(doc => {
            const d = doc.data();
            console.log('📄 doc data:', d);

            // ดึงข้อมูลจาก formData
            const formData = d.formData || {}; // ใช้ default ถ้าไม่มี formData
            const predictionResult = d.predictionResult; // ดึงค่า predictionResult

            return {
              date: d.timestamp?.toDate(),
              hypertension: formData.hypertension,
              heartDisease: formData.heartDisease,
              smokingStatus: formData.smokingStatus,
              hbA1c: formData.hbA1c,
              currentBloodSugar: formData.currentBloodSugar,
              predictionResult: predictionResult, // เก็บค่าผลทำนาย
            };
          });

          setHistoryData(data);
        } catch (error) {
          console.error('❌ Error fetching history:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('⚠️ No user logged in');
        setLoading(false);
      }
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  const formatDate = (date) => {
    if (!date) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="history">
      <div className="history-box">
        <h2 className="history-title">ประวัติการทำนาย</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ความดันโลหิตสูง</th>
              <th>โรคหัวใจ</th>
              <th>การสูบบุหรี่</th>
              <th>HbA1c</th>
              <th>ระดับน้ำตาลในเลือด</th>
              <th>ผลทำนาย</th> {/* เพิ่มคอลัมน์ผลทำนาย */}
            </tr>
          </thead>
          <tbody>
            {historyData.length === 0 ? (
              <tr><td colSpan="7">ไม่มีข้อมูล</td></tr>
            ) : (
              historyData.map((item, index) => (
                <tr key={index}>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.hypertension ? 'เป็น' : 'ไม่เป็น'}</td>
                  <td>{item.heartDisease ? 'เป็น' : 'ไม่เป็น'}</td>
                  <td>{item.smokingStatus}</td>
                  <td>{item.hbA1c}</td>
                  <td>{item.currentBloodSugar}</td>
                  <td>{item.predictionResult === 1 ? 'มีโอกาส' : 'ไม่มีโอกาส'}</td> {/* แสดงผลทำนาย */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
