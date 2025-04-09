import React from 'react'
import { Outlet } from "react-router-dom";
import FooterUser from '../tabbar/FooterUser';
import MainNavUser from '../tabbar/MainNavUser';
import { Navigate } from "react-router-dom";


const LayoutUser = () => {


    return (
        <div>
            <MainNavUser />
            <Outlet />
            <FooterUser />

        </div>
    )
}

export default LayoutUser
