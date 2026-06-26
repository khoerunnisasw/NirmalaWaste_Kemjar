const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Akses ditolak. Silakan login terlebih dahulu.' });
};

const checkRole = (role) => {
    return (req, res, next) => {
        const userRole = req.session.role ? req.session.role.toLowerCase() : '';
        const targetRole = role.toLowerCase();

        if (userRole === targetRole) {
            next(); 
        } else {
            return res.status(403).json({ error: 'Akses ditolak: Anda tidak memiliki izin untuk halaman ini.' });
        }
    };
};

module.exports = { isAuthenticated, checkRole };