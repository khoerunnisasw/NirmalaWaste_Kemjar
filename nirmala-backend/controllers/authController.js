const bcrypt = require('bcrypt');
const db = require('../config/db');
const logger = require('../config/logger');

const registerUser = async (req, res) => {
    const { username, password, nama_lengkap, no_telp, alamat } = req.body; 
    const finalNama = nama_lengkap || null;
    const finalNoTelp = no_telp || null;
    const finalAlamat = alamat || null;
    const roleOtomatis = 'Warga';

    try {
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const query = 'INSERT INTO users (username, password, role, nama_lengkap, no_telp, alamat) VALUES (?, ?, ?, ?, ?, ?)';
        
        await db.execute(query, [username, hashedPassword, roleOtomatis, finalNama, finalNoTelp, finalAlamat]);

        logger.info(`User baru terdaftar: ${username} dengan role ${roleOtomatis}`);
        res.status(201).json({ message: 'Registrasi berhasil.' });
    } catch (error) {
        logger.error(`Error registrasi: ${error.message}`);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username sudah terpakai!' });
        }
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.role = user.role;
            
            logger.info(`User login sukses: ${username}`);
            res.json({ 
                message: 'Login berhasil.',
                role: user.role
            });
        } else {
            logger.warn(`Login gagal untuk username: ${username}`);
            res.status(401).json({ error: 'Username atau password salah.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};

const getPoinWarga = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT poin FROM users WHERE id = ?', [req.session.userId]);
        
        if (rows.length > 0) {
            res.json({ poin: rows[0].poin });
        } else {
            res.status(404).json({ error: 'User tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil poin' });
    }
};

module.exports = { registerUser, loginUser, getPoinWarga };