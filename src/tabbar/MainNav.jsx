import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import './MainNav.css'

function MainNav() {
    return (
        <div className='MainNav'>

            <Link to={'/'}>
                <span className='boxlogo'>
                    <img className='logo' src="/images/Logo.jpg" /> Diacare
                </span>
            </Link>

            <div className='box'>
                <Link to={'/'}>หน้าหลัก</Link>
                <Link to={'/predict'}>วิเคราะความเสี่ยง</Link>
                <Link to={'/login'}>เข้าสู่ระบบ</Link>
            </div>
        </div>
    )
}

export default MainNav
