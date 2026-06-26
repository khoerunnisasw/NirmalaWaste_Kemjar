const db = require('../config/db');
const logger = require('../config/logger');

const verifikasiSampah = async (req, res) => {
    const { transaksiId, status } = req.body; 

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status tidak valid.' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM transaksi WHERE id = ?', [transaksiId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
        
        const transaksi = rows[0];
        if (transaksi.status !== 'Pending') {
            return res.status(400).json({ error: 'Transaksi sudah diverifikasi sebelumnya.' });
        }

        await db.execute('UPDATE transaksi SET status = ? WHERE id = ?', [status, transaksiId]);

        if (status === 'Approved') {
            let poinTambahan = 0;
            if (transaksi.kategori === 'organik') {
                poinTambahan = transaksi.berat * 100;
            } else if (transaksi.kategori === 'anorganik') {
                poinTambahan = transaksi.berat * 150;
            }

            await db.execute('UPDATE users SET poin = poin + ? WHERE id = ?', [poinTambahan, transaksi.user_id]);
            logger.info(`Transaksi ID ${transaksiId} di-Approved oleh Admin. Poin ditambahkan.`);
        } else {
            logger.info(`Transaksi ID ${transaksiId} di-Rejected oleh Admin.`);
        }

        res.json({ message: `Verifikasi berhasil. Status transaksi menjadi: ${status}` });

    } catch (error) {
        logger.error(`Error verifikasi admin: ${error.message}`);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};

const getSemuaTransaksi = async (req, res) => {
    try {
        const query = 'SELECT t.id, u.username AS user, t.kategori, t.berat, t.status, t.foto FROM transaksi t JOIN users u ON t.user_id = u.id ORDER BY t.id DESC';
        const [rows] = await db.execute(query);
        res.status(200).json(rows);
    } catch (error) {
        logger.error(`Error mengambil semua transaksi: ${error.message}`);
        res.status(500).json({ error: 'Gagal mengambil data antrean setoran.' });
    }
};

module.exports = { verifikasiSampah, getSemuaTransaksi };