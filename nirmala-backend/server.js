require('dotenv').config();
const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const xss = require('xss');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const cors = require('cors');
const path = require('path');
const logger = require('./config/logger');
const upload = require('./middleware/upload');
const db = require('./config/db');
const { validateWasteInput, submitWaste } = require('./controllers/wasteController');
const { isAuthenticated, checkRole } = require('./middleware/auth');
const { verifikasiSampah, getSemuaTransaksi } = require('./controllers/adminController');
const { loginUser, registerUser, getPoinWarga } = require('./controllers/authController');
const wafMiddleware = require('./middleware/waf');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.CLIENT_URL || 'https://localhost:5173', 
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

app.use(helmet());

const cleanXSS = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = xss(req.body[key]);
            }
        }
    }
    next();
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cleanXSS);

app.use(wafMiddleware);

app.set('trust proxy', 1);

app.use(session({
    secret: process.env.SESSION_SECRET || 'nirmala-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: true, 
        sameSite: 'strict', 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

const csrfProtection = csurf();
app.use(csrfProtection);

app.get('/api/csrf-token', (req, res) => {
    const token = req.csrfToken();
    
    req.session.save((err) => {
        if (err) {
            logger.error("Gagal menyimpan sesi CSRF");
            return res.status(500).json({ error: "Gagal membuat token keamanan" });
        }
        res.json({ csrfToken: token });
    });
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: 'Terlalu banyak percobaan login, silakan coba lagi setelah 15 menit.',
    handler: (req, res, next, options) => {
        logger.warn(`Brute force attempt detected from IP: ${req.ip}`);
        res.status(options.statusCode).send(options.message);
    }
});

app.post('/api/register', registerUser);
app.post('/api/login', loginLimiter, loginUser);
app.post('/api/setoran', upload.single('foto'), validateWasteInput, submitWaste);
app.put('/api/admin/verifikasi', isAuthenticated, checkRole('Admin'), verifikasiSampah);
app.get('/api/admin/transaksi', isAuthenticated, checkRole('Admin'), getSemuaTransaksi);
app.get('/api/poin', isAuthenticated, getPoinWarga);

app.get('/api/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: "Sesi tidak ditemukan, silakan login kembali" });
        }

        const [rows] = await db.execute(
            'SELECT nama_lengkap, poin FROM users WHERE id = ?', 
            [userId]
        );
        
        if (rows.length > 0) {
            res.json({ 
                full_name: rows[0].nama_lengkap || 'Warga', 
                poin: rows[0].poin || 0 
            });
        } else {
            res.status(404).json({ error: "User tidak ditemukan" });
        }
    } catch (error) {
        logger.error("Error saat ambil profil: " + error.message);
        res.status(500).json({ error: "Gagal ambil profil" });
    }
});

app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        logger.warn(`Blokir CSRF aktif untuk IP: ${req.ip}`);
        return res.status(403).json({ error: 'Akses ditolak: Token keamanan (CSRF) tidak valid atau kedaluwarsa.' });
    }
    next(err); 
});

const PORT = process.env.PORT || 3000;

const sslOptions = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
};

https.createServer(sslOptions, app).listen(PORT, () => {
    logger.info(`Nirmala Waste Platform berjalan dengan HTTPS/TLS di port ${PORT}`);
});