import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // นำเข้า Firebase

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!name) {
      setError("กรุณากรอกชื่อ");
      return;
    }
    if (!email) {
      setError("กรุณากรอกอีเมล");
      return;
    }
    if (!password) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    try {
      // สมัครสมาชิกกับ Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("สมัครสมาชิกสำเร็จ:", user); // ตรวจสอบค่า user

      // เก็บข้อมูลลง Firestore (Cloud Database)
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        uid: user.uid,
      });

      console.log("บันทึกข้อมูลผู้ใช้ลง Firestore สำเร็จ");

      // เปลี่ยนไปหน้า /user หลังจากสมัครเสร็จ
      navigate("/user"); 
    } catch (err) {
      console.error("เกิดข้อผิดพลาด:", err);
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          className="w-full p-2 border rounded mb-4"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded mb-4"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded mb-4"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignUp} className="w-full bg-green-500 text-white p-2 rounded">
          Sign Up
        </button>
        <p className="mt-4 text-center">
          Already have an account? <Link to="/login" className="text-green-500">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
