import React, { useState } from "react";
import { login } from "./authService";
import { Link, useNavigate } from "react-router-dom";
import './Login.css';


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate("/user"); // เปลี่ยนไปหน้า Dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login">
      <div className="box-top">
        <div className="box-login">
          <div className="login-1">Login</div>
          {error && <p className="text-red-500">Email{error}</p>}
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="login-button">
            Login
          </button>
          <p className="mt-4 text-center">
            Don't have an account? <Link to="/register" className="text-blue-500">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
