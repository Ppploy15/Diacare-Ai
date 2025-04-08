import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth'; // ใช้ Firebase Auth
import { getDoc, doc, getFirestore } from 'firebase/firestore'; // ใช้ Firestore
import './MainNav.css';

function MainNav() {
  const [userName, setUserName] = useState(null); // สถานะสำหรับชื่อผู้ใช้
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const [showContent, setShowContent] = useState(false);
  // ฟังก์ชันเพื่อดึงข้อมูลผู้ใช้จาก Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserName(docSnapshot.data().name); // เก็บชื่อผู้ใช้จาก Firestore
        }
      });
    } else {
      setUserName(null); // ถ้าไม่มีผู้ใช้
    }
  }, [auth.currentUser]);

  const handleLogout = async () => {
    // ออกจากระบบและนำทางไปที่หน้า login
    navigate("/login");
  };



  return (
    <div className="MainNav">
      <Link to="/">
        <span className="boxlogo">
          <img className="logo" src="/images/Logo.jpg" alt="Logo" /> Diacare
        </span>
      </Link>

      <div className="box">
        <Link to="/user">หน้าหลัก</Link>
        <Link to="/user/predict">วิเคราะความเสี่ยง</Link>
        
        <div className='button-logout' onClick={() => setShowContent(!showContent)}>
          {userName ? (
            <span className="userName">{userName}<img src="/images/navigate.png" /></span> // แสดงชื่อผู้ใช้
          ) : (
            <span>กำลังโหลด...</span> // ถ้ายังไม่มีข้อมูลชื่อผู้ใช้
          )}
          {showContent && (
            <div className="dropdown-content">
              <Link className="logout" to="/user/history">ประวัติ</Link>
              <Link className="logout" onClick={handleLogout}>ออกจากระบบ</Link>
              
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default MainNav;
