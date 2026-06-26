const logger = require('../config/logger');

const wafMiddleware = (req, res, next) => {
    const userAgent = req.headers['user-agent'] ? req.headers['user-agent'].toLowerCase() : '';
    const blockedAgents = ['sqlmap', 'nikto', 'nmap', 'curl', 'wget', 'zgrab', 'masscan', 'dirb', 'gobuster'];

    if (blockedAgents.some(agent => userAgent.includes(agent))) {
        logger.warn(`[WAF/IDS] Serangan Scanner Diblokir dari IP: ${req.ip} | Agent: ${userAgent}`);
        return res.status(403).json({ error: "Akses ditolak: Penggunaan alat pemindai otomatis tidak diizinkan (WAF Policy)." });
    }

    const maliciousPatterns = [
        /(?:<script.*?>|<\/script>)/i, // Deteksi XSS Lanjut
        /(?:UNION\s+ALL\s+SELECT|SELECT\s+.*?\s+FROM|INSERT\s+INTO|DROP\s+TABLE|1=1)/i, // Deteksi SQL Injection Brutal
        /(?:\.\.\/|\.\.\\)/i, // Deteksi Directory Traversal (Mencari celah file konfigurasi)
        /(?:etc\/passwd|windows\\system32)/i // Deteksi pembacaan file sensitif OS
    ];

    const payloadString = JSON.stringify({ 
        url: req.originalUrl, 
        query: req.query, 
        body: req.body 
    });

    const isMalicious = maliciousPatterns.some(pattern => pattern.test(payloadString));

    if (isMalicious) {
        logger.error(`[WAF/IDS] Intrusion Payload Terdeteksi dari IP: ${req.ip} | Target: ${req.originalUrl}`);
        return res.status(403).json({ error: "Akses ditolak: Permintaan terdeteksi sebagai anomali (IDS Policy)." });
    }

    next();
};

module.exports = wafMiddleware;