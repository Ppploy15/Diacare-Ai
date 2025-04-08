import React, { useEffect, useState } from 'react'; 
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true); // เพิ่ม loading state เพื่อบอกว่ากำลังโหลดข้อมูล

  useEffect(() => {
    const fetchHistory = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getFirestore();
        const userCollection = collection(db, 'prediction_history'); // ชื่อ collection
        const q = query(userCollection, where('uid', '==', user.uid), orderBy('timestamp', 'desc'));

        try {
          const querySnapshot = await getDocs(q);
          console.log('querySnapshot:', querySnapshot); // เพิ่มเพื่อดูผลลัพธ์
          
          const data = querySnapshot.docs.map(doc => {
            const d = doc.data();
            console.log('doc data:', d); // พิมพ์ข้อมูลที่ได้จาก Firestore

            return {
              date: d.timestamp?.toDate(), // แปลง Timestamp เป็น Date
              hypertension: d.hypertension,
              heartDisease: d.heartDisease,
              smokingStatus: d.smokingStatus,
              hbA1c: d.hbA1c,
              currentBloodSugar: d.currentBloodSugar
            };
          });

          setHistoryData(data); // อัพเดต state ด้วยข้อมูลที่ดึงมา
        } catch (error) {
          console.error('Error fetching history:', error);
        } finally {
          setLoading(false); // เปลี่ยนสถานะการโหลดเป็น false
        }
      } else {
        setLoading(false); // ถ้าไม่มีผู้ใช้ให้หยุดการโหลด
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (date) => {
    if (!date) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('th-TH', options);
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>; // แสดงข้อความระหว่างโหลดข้อมูล
  }

  return (
    <div>
      <h2>ประวัติการทำนาย</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>วันที่</th>
            <th>ความดันโลหิตสูง</th>
            <th>โรคหัวใจ</th>
            <th>การสูบบุหรี่</th>
            <th>HbA1c</th>
            <th>ระดับน้ำตาลในเลือด</th>
          </tr>
        </thead>
        <tbody>
          {historyData.length === 0 ? (
            <tr><td colSpan="6">ไม่มีข้อมูล</td></tr>
          ) : (
            historyData.map((item, index) => (
              <tr key={index}>
                <td>{formatDate(item.date)}</td>
                <td>{item.hypertension ? 'ใช่' : 'ไม่ใช่'}</td>
                <td>{item.heartDisease ? 'ใช่' : 'ไม่ใช่'}</td>
                <td>{item.smokingStatus}</td>
                <td>{item.hbA1c}</td>
                <td>{item.currentBloodSugar}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default History;
