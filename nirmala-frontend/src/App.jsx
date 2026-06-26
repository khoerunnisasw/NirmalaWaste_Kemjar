import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './pages/Login';
import Register from './pages/Register';
import WargaDashboard from './pages/WargaDashboard';
import AdminDashboard from './pages/AdminDashboard';

axios.defaults.withCredentials = true;

export default function App() {
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('/api/csrf-token');
        axios.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken;
        console.log("Kunci Keamanan (CSRF) Berhasil Sinkron!");
        
        setIsSecure(true); 
      } catch (error) {
        console.error("Gagal sinkronisasi keamanan:", error);
        setIsSecure(true); 
      }
    };

    fetchCsrfToken();
  }, []);

  if (!isSecure) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-emerald-700 font-bold tracking-wide">Menyiapkan Jalur Aman...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/WargaDashboard" element={<WargaDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}