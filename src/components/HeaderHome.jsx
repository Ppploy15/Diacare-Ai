import React from 'react';
import './HeaderHome.css';
import { useNavigate } from 'react-router-dom';

const HeaderHome = () => {
  const navigate = useNavigate();  // ประกาศ navigate ด้วย useNavigate

  return (
    <div className='hearderhome'>
      <div className='box-top'>
        <div>Diacare Stronger Health Starts Here</div>
        <div>สุขภาพแข็งแรง เริ่มที่นี่</div>
        <div>DiaCare คือแอปพลิเคชันที่ถูกออกแบบมาเพื่อให้พยากรณ์หรือคาดการณ์<br />
          ความเสี่ยงโรคเบาหวานอย่างแม่นยำ เราเชื่อว่าการเข้าถึงฟีเจอร์และข้อมูลที่มีประโยชน์<br />
          จะช่วยให้คุณดูแลสุขภาพของตัวเองได้อย่างมั่นใจ</div>
        <button onClick={() => navigate("predict")}>PREDICT</button>
      </div>
      <div className='box-button'>
        <div className='button'>
          <img className='img-button' src="/images/button-home-1.png" alt="" />
          <h1>ควบคุมโรคเร็วขึ้น</h1>
          <hr />
          <h2>ลดความเสี่ยงจากภาวะแทรกซ้อน<br />
          และรักษาสุขภาพได้อย่างมีประสิทธิภาพ</h2>
        </div>
        <div className='button'>
          <img className='img-button' src="/images/button-home-2.png" alt="" />
          <h1>ปรับพฤติกรรมทันเวลา</h1>
          <hr />
          <h2>ปรับการกินและออกกำลังกาย<br />
          เพื่อลดระดับน้ำตาลในเลือดได้ทันท่วงที</h2>
        </div>
        <div className='button'>
          <img className='img-button' src="/images/button-home-3.png" alt="" />
          <h1>วางแผนการรักษาเหมาะสม</h1>
          <hr />
          <h2>รับคำแนะนำจากแพทย์เพื่อการดูแล<br />
          ที่ตรงจุดและเหมาะสมกับสภาพร่างกาย</h2>
        </div>
        <div className='button'>
          <img className='img-button' src="/images/button-home-4.png" alt="" />
          <h1>ลดค่าใช้จ่ายรักษา</h1>
          <hr />
          <h2>ป้องกันโรคแทรกซ้อน <br />
          ช่วยลดภาระค่าใช้จ่ายในการรักษาระยะยาว</h2>
        </div>
      </div>
    </div>
  );
};

export default HeaderHome;
