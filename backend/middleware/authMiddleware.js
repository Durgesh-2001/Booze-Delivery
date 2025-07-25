import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Adjust the path as necessary
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user; // now req.user._id works perfectly
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};