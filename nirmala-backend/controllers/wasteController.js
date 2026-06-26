const db = require('../config/db');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const validateWasteInput = [
    body('berat')
        .isFloat({ gt: 0 }).withMessage('Berat sampah harus berupa angka positif.')
        .escape(),
    body('kategori')
        .trim()
        .isIn(['organik', 'anorganik']).withMessage('Kategori tidak valid.')
        .escape()
];

const submitWaste = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { berat, kategori } = req.body;
    const userId = req.session.userId; 
    if (!req.file) {
        return res.status(400).json({ error: 'Foto bukti wajib diunggah.' });
    }

    try {
        const filename = `${uuidv4()}.jpg`; 
        const outputPath = path.join(__dirname, '../uploads', filename);

        await sharp(req.file.buffer)
            .resize({ width: 800, withoutEnlargement: true }) 
            .jpeg({ quality: 80 }) 
            .toFile(outputPath);

        const query = 'INSERT INTO transaksi (user_id, berat, kategori, foto, status) VALUES (?, ?, ?, ?, "Pending")';
        await db.execute(query, [userId, berat, kategori, filename]);

        logger.info(`Setoran sampah dicatat oleh user ID: ${userId}`);
        res.status(201).json({ message: 'Setoran sampah berhasil dicatat.' });
    } catch (error) {
        logger.error(`Gagal memproses setoran sampah: ${error.message}`);
        res.status(500).json({ error: 'Gagal menyimpan transaksi atau format gambar rusak.' });
    }
};

const getMyHistory = async (req, res) => {
    const userId = req.session.userId;
    
    try {
        const [rows] = await db.execute('SELECT * FROM transaksi WHERE user_id = ?', [userId]);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil riwayat transaksi.' });
    }
};

module.exports = { validateWasteInput, submitWaste, getMyHistory };