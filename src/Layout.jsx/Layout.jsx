import React from 'react'
import { Outlet } from 'react-router-dom'
import MainNav from '../tabbar/MainNav'
import Footer from '../tabbar/Footer'

const Layout = () => {
  return (
    <div>
      <MainNav/>
      <Outlet/>
      <Footer/>
      
    </div>
  )
}

export default Layout
