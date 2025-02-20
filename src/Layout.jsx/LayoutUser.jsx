import React from 'react'
import { Outlet } from "react-router-dom";
import Footer from '../tabbar/Footer';
import MainNavUser from '../tabbar/MainNavUser';
import { Navigate } from "react-router-dom";


const LayoutUser = () => {


    return (
        <div>
            <MainNavUser />
            <Outlet />
            <Footer />

        </div>
    )
}

export default LayoutUser
