import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "../pages/auth/Login";
import Home from "../pages/Home";
import Predict from "../pages/Predict";
import Register from "../pages/auth/Register";
import Layout from "../Layout.jsx/Layout";
import LayoutUser from "../Layout.jsx/LayoutUser";
import HomeUser from "../pages/user/HomeUser";
import PredictUser from "../pages/user/PredictUser";
import History from "../pages/user/History";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "predict", element: <Predict /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/user",
    element: <LayoutUser />, // ✅ ใช้ LayoutUser แทน PrivateRoute
    children: [
      { index: true, element: <HomeUser /> },
      { path: "history", element: <History /> },
      { path: "predict", element: <Predict /> },
    ],
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
