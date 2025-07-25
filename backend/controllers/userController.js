import userModel from "../models/userModel.js"; 
import Order from "../models/orderModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import Address from '../models/addressModel.js';

// Count total number of users
export const countUsers = async (req, res) => {
    try {
        const userCount = await userModel.countDocuments();
        res.json({ count: userCount });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching user count',
            error: error.message
        });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const tokenSecret = user.isAdmin ? process.env.ADMIN_JWT_SECRET : process.env.JWT_SECRET;
        const token = jwt.sign(
            { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                isAdmin: user.isAdmin 
            },
            tokenSecret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Login failed" });
    }
};

// Admin login
export const adminLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide email and password" 
            });
        }

        const user = await userModel.findOne({ email })
            .select('+password +isAdmin');

        if (!user || !user.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: "Admin access required" 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid credentials" 
            });
        }

        const token = jwt.sign(
            { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                isAdmin: true
            },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: true
            }
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Admin login failed" 
        });
    }
};

// Create JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register user
const registerUser = async (req, res) => {
    const { name, email, password, dob } = req.body;
    try {
        if (!name || !email || !password || !dob) {
            return res.json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 21) {
            return res.json({
                success: false,
                message: "You must be 21+ to access this site."
            });
        }

        if (!validator.isEmail(email)) {
            return res.json({ 
                success: false, 
                message: "Invalid email format" 
            });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ 
                success: false, 
                message: "Email already registered" 
            });
        }

        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            dob: birthDate,
            isAdmin: false
        });

        const savedUser = await newUser.save();
        const token = createToken(savedUser._id);

        res.json({
            success: true,
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                isAdmin: savedUser.isAdmin
            },
            message: "Signup successful! ID proof verification coming soon in future updates. Enjoy responsibly."
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin
        };

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user profile"
        });
    }
};

// Update user address
export const updateUserAddress = async (req, res) => {
    const { addressType, addressLine, city, state, pincode } = req.body;
    try {
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        user.address = {
            type: addressType || user.address.type,
            addressLine: addressLine || user.address.addressLine,
            city: city || user.address.city,
            state: state || user.address.state,
            pincode: pincode || user.address.pincode
        };

        await user.save();

        res.json({
            success: true,
            message: "Address updated successfully",
            address: user.address
        });
    } catch (error) {
        console.error('Error updating user address:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update address",
            error: error.message
        });
    }
};

// Admin: Get user orders
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await Order.find({ userId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders: orders.map(order => ({
                ...order.toObject(),
                userName: order.userId?.name || 'Unknown User',
                userEmail: order.userId?.email || 'No Email'
            }))
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user orders',
            error: error.message
        });
    }
};

// Admin: Update user admin status
export const updateUserAdminStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isAdmin } = req.body;

        if (typeof isAdmin !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isAdmin must be a boolean value'
            });
        }

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.isAdmin = isAdmin;
        await user.save();

        res.json({
            success: true,
            message: `User admin status updated to ${isAdmin}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Error updating user admin status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user admin status',
            error: error.message
        });
    }
};

// Validate admin token
export const validateAdminToken = async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error("Admin token validation error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error validating admin token" 
        });
    }
};

// ✅ Clean initializeAdmin function
export const initializeAdmin = async (req, res) => {
    try {
        const { name, email, password, dob } = req.body;

        if (!name || !email || !password || !dob) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, password, and date of birth"
            });
        }

        // Age validation (must be 21+)
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 21) {
            return res.status(400).json({
                success: false,
                message: "You must be 21+ to access this site."
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already registered" 
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const existingAdmin = await userModel.findOne({ isAdmin: true });
        if (existingAdmin) {
            return res.status(403).json({
                success: false,
                message: "Admin user already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = new userModel({
            name,
            email,
            password: hashedPassword,
            dob: birthDate,
            isAdmin: true
        });

        const savedUser = await adminUser.save();
        const token = jwt.sign(
            { 
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                isAdmin: true
            },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: "Admin user initialized successfully",
            token,
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                isAdmin: true
            }
        });
    } catch (error) {
        console.error("Admin initialization error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize admin user",
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// Save address
export const saveAddress = async (req, res) => {
    try {
        const { userId, address } = req.body;
        
        if (!userId || !address) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const addressData = {
            userId,
            type: address.type,
            address: address.address,
            city: address.city,
            state: address.state,
            pincode: address.pincode
        };

        const savedAddress = await Address.findOneAndUpdate(
            { userId },
            addressData,
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Address saved successfully',
            address: savedAddress
        });
    } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving address',
            error: error.message
        });
    }
};

export const getAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await Address.find({ userId });
        
        res.json({
            success: true,
            addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching addresses',
            error: error.message
        });
    }
};

export { loginUser, registerUser, getUserProfile };
