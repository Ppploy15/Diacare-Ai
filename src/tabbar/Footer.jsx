import React from 'react'
import './Footer.css'
import { Link, Outlet } from 'react-router-dom'
function Footer() {
    return (
        <div className='footer'>
            <div className='footer-top'>
                        <div></div>
                        <Link to={'/'}>
                            <span className='boxlogo'>
                                <img className='logo' src="/images/Logo.jpg" />   Diacare
                            </span>
                        </Link>
            
                            <Link to={'/'}>หน้าหลัก</Link>
                            <Link to={'/predict'}>วิเคราะความเสี่ยง</Link>
                            <Link to={'/login'}>เข้าสู่ระบบ</Link>
                        <div>
                            <div className='f-footer-top'>ติดต่อสอบถาม</div>
                            <div className='f-footer-top-2'>diacare.healthcare@gmail.com<br />
                            (+66)00-000-0000
                            </div>
                        </div>
                    </div>
            <div className='button'>copyright © 2024 all rights reserved</div>
        </div>
    )
}

export default Footer
