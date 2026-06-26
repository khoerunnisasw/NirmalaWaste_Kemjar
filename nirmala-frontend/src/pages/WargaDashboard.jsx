import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logoNirmala from '../assets/nirmala.svg';

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole') || 'Warga';
  const [userData, setUserData] = useState({ full_name: '', poin: 0 });

  const [berat, setBerat] = useState('');
  const [kategori, setKategori] = useState('organik');
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        setUserData({
          full_name: response.data.full_name, 
          poin: response.data.poin
        });
      }
      catch (error) {
        console.error("Gagal mengambil data profil:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleSetoran = async (e) => {
    e.preventDefault();
    if (!foto) return alert("Pilih foto terlebih dahulu!");

    const formData = new FormData();
    formData.append('berat', berat);
    formData.append('kategori', kategori);
    formData.append('foto', foto);

    try {
      await axios.post('/api/setoran', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'X-CSRF-Token': axios.defaults.headers.common['X-CSRF-Token']
        }
      });
      alert("Setoran berhasil dicatat!");
      setBerat('');
      setFoto(null);
    } catch (error) {
      alert("Gagal: " + (error.response?.data?.errors?.[0]?.msg || error.response?.data?.error || "Error saat upload"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-200">
      <nav className="bg-emerald-600 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2">
           <img src={logoNirmala} alt="Logo Nirmala" className="w-8 h-8 object-contain brightness-0 invert" />
           <h1 className="text-xl font-bold tracking-wide">Nirmala</h1>
        </div>
        <button onClick={handleLogout} className="text-sm bg-emerald-700/50 border border-emerald-500 px-4 py-1.5 rounded-lg hover:bg-emerald-800 transition-colors">
          Keluar
        </button>
      </nav>

      <main className="p-4 md:p-6 max-w-2xl mx-auto mt-4 md:mt-8">
        
        {/* Header Section dengan Animasi Hover */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-700 flex items-center gap-2">
              Halo, {userData.full_name}! 
              <span className="inline-block animate-bounce origin-bottom-right">👋</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">Mari hijaukan lingkungan kita hari ini.</p>
          </div>
          
          {/* Kartu Poin yang interaktif */}
          <div className="w-full sm:w-auto bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 text-center transform hover:scale-105 hover:shadow-md transition-all duration-300 group cursor-default">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Poin Saya</p>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 group-hover:scale-110 transition-transform">
              {userData.poin}
            </p>
          </div>
        </div>

        {role === 'Warga' && (
          <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 p-6 md:p-8">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Form Setoran Sampah ♻️</h3>
              <p className="text-xs text-slate-500 mt-1">Pastikan foto terlihat terang dan jelas.</p>
            </div>
            
            <form onSubmit={handleSetoran} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-700 cursor-pointer"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                  >
                    <option value="organik">🍂 Organik</option>
                    <option value="anorganik">🥤 Anorganik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Berat (Kg)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-700"
                    value={berat}
                    onChange={(e) => setBerat(e.target.value)}
                    placeholder="Contoh: 1.5"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Foto Bukti Fisik</label>
                <div className="relative flex items-center justify-center w-full">
                  <input 
                    type="file" accept="image/png, image/jpeg"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors cursor-pointer border border-dashed border-slate-300 rounded-xl p-2 hover:border-emerald-400"
                    onChange={(e) => setFoto(e.target.files[0])}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 mt-6 flex justify-center items-center gap-2"
              >
                Kirim Laporan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}