import { supabaseAdmin } from '../services/supabaseService.js';
import jwt from 'jsonwebtoken';

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token missing or malformed' });
    }

    try {
        // 1. Verify token using Supabase Admin Auth API (most reliable)
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (!error && user) {
            req.user = {
                sub: user.id,
                id: user.id,
                email: user.email,
                ...user,
            };
            req.token = token;
            return next();
        }

        // 2. Fallback: JWT local verification if secret configured
        if (process.env.SUPABASE_JWT_SECRET && process.env.SUPABASE_JWT_SECRET !== 'YOO_KUSO') {
            const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
            req.user = decoded;
            req.token = token;
            return next();
        }

        return res.status(403).json({ error: 'Invalid or expired token' });
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
