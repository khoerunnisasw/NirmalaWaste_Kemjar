import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoNirmala from '../assets/nirmala.svg';

axios.defaults.withCredentials = true;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const response = await axios.post('/api/login', {
        username: username,
        password: password
      });

      const userRole = response.data.role || 'Warga';
      localStorage.setItem('userRole', userRole);
      
      if (userRole.toLowerCase() === 'admin') {
        navigate('/AdminDashboard'); 
      } else {
        navigate('/WargaDashboard'); 
      }

    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Terjadi kesalahan server");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-t-4 border-emerald-500">
        
        <div className="text-center mb-8">
          <img 
            src={logoNirmala} 
            alt="Logo Nirmala Waste" 
            className="w-16 h-16 mx-auto mb-4 object-contain drop-shadow-sm" 
          />
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Nirmala Waste</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Masuk untuk mulai kelola sampahmu</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center font-medium shadow-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"          
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input 
              type="password"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 mt-2"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Belum punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')} 
              className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
            >
              Daftarkan Diri Anda di sini
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}