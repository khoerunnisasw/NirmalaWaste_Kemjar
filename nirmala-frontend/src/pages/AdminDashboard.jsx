import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import logoNirmala from '../assets/nirmala.svg';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [transaksi, setTransaksi] = useState([]); 
  const [fotoMembesar, setFotoMembesar] = useState(null);

  useEffect(() => {
    const fetchTransaksi = async () => {
      try {
        const response = await axios.get('/api/admin/transaksi');
        setTransaksi(Array.isArray(response.data) ? response.data : []); 
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
           navigate('/');
        }
      }
    };

    fetchTransaksi();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const handleVerifikasi = async (id, statusBaru) => {
    try {
      await axios.put('/api/admin/verifikasi', {
        transaksiId: id,
        status: statusBaru
      });
      alert(`Transaksi ${id} berhasil di-${statusBaru}`);
      setTransaksi(transaksi.map(t => 
        t.id === id ? { ...t, status: statusBaru } : t
      ));
    } catch (error) {
      alert("Gagal: " + (error.response?.data?.error || "Terjadi kesalahan"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <img src={logoNirmala} alt="Logo Nirmala" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold tracking-wide text-emerald-400">Panel Petugas</h1>
        </div>
        <button onClick={handleLogout} className="text-sm bg-slate-800 border border-slate-600 px-4 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
          Keluar
        </button>
      </nav>

      <main className="p-4 md:p-8 max-w-6xl mx-auto mt-2">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Daftar Antrean</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Verifikasi setoran sampah warga secara real-time.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Nama Warga</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Detail</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Bukti Foto</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksi.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">
                      Belum ada setoran baru hari ini.
                    </td>
                  </tr>
                ) : (
                  transaksi.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                      <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{item.user}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className="capitalize font-medium">{item.kategori}</span>
                         <span className="text-slate-500 block text-xs mt-0.5">{item.berat} Kg</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.foto ? (
                          <button 
                            onClick={() => setFotoMembesar(item.foto)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Tanpa Foto</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                          item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.status === 'Pending' ? (
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => handleVerifikasi(item.id, 'Approved')}
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                            >
                              Valid
                            </button>
                            <button 
                              onClick={() => handleVerifikasi(item.id, 'Rejected')}
                              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium italic">Selesai diverifikasi</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Komponen Modal / Pop-up Foto */}
      {fotoMembesar && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setFotoMembesar(null)} // Tutup jika background gelap diklik
        >
          {/* Box gambar, e.stopPropagation() agar tidak tertutup jika gambarnya yang diklik */}
          <div className="relative max-w-2xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setFotoMembesar(null)}
              className="absolute -top-12 right-0 md:-right-8 text-white hover:text-emerald-400 transition-colors font-bold flex items-center gap-2"
            >
              Tutup
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <img 
              src={`/uploads/${fotoMembesar}`} 
              alt="Bukti Setoran Diperbesar" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl border-4 border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}