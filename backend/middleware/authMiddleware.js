import jwt from 'jsonwebtoken';

// Authenticate user/doctor/admin
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.userId = decoded.id;
            req.userRole = decoded.role; // Extract role from token to use in specific protect layers if needed

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

// Admin middleware
export const protectAdmin = (req, res, next) => {
    if (req.userRole && req.userRole === 'Admin') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized as an admin' });
    }
};

// Doctor middleware (if needed specifically)
export const protectDoctor = (req, res, next) => {
    if (req.userRole && req.userRole === 'Doctor') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized as a doctor' });
    }
};
