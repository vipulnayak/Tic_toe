import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';

export default function Component() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          <Routes>
            <Route path="/login" element={
              token ? <Navigate to="/game" replace /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              token ? <Navigate to="/game" replace /> : <Register onLogin={handleLogin} />
            } />
            <Route path="/game" element={
              token ? <Game onLogout={handleLogout} /> : <Navigate to="/login" replace />
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}