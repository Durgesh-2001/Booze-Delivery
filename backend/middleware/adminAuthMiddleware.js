import jwt from 'jsonwebtoken';

export const adminAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        try {
         // Decode the token
            const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
            
            if (!decoded.isAdmin) {
                return res.status(403).json({ 
                    success: false, 
                    message: 'Admin access required' 
                });
            }
            // Attach verified user to request
            req.user = {
                id: decoded.id,
                name: decoded.name,
                email: decoded.email,
                isAdmin: decoded.isAdmin
            };

            next();
        } catch (tokenError) {
            console.error('Token validation error:', tokenError);
            if (tokenError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Admin token has expired' 
                });
            }
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid admin token' 
            });
        }
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during admin authentication'
        });
    }
};
