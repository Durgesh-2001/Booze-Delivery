import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import orderModel from '../models/orderModel.js';

export const getDashboardStats = async (req, res) => {
    try {
        // Get total users count
        const usersCount = await userModel.countDocuments();

        // Get total products count
        const productsCount = await productModel.countDocuments();

        // Get orders statistics
        const orders = await orderModel.find();
        const ordersCount = orders.length;
        
        // Calculate revenue
        const revenue = orders.reduce((total, order) => total + (order.totalAmount || 0), 0);

        // Count orders by status
        const pendingOrders = orders.filter(order => 
            ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery'].includes(order.status)
        ).length;

        const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;

        // Get recent orders (last 5)
        const recentOrders = await orderModel.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        // Get top selling products
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (productSales[item.productId]) {
                    productSales[item.productId] += item.quantity;
                } else {
                    productSales[item.productId] = item.quantity;
                }
            });
        });

        // Convert to array and sort by quantity
        const topProducts = await Promise.all(
            Object.entries(productSales)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(async ([productId, quantity]) => {
                    const product = await productModel.findById(productId);
                    return {
                        name: product ? product.name : 'Unknown Product',
                        quantity,
                        revenue: orders.reduce((total, order) => {
                            const item = order.items.find(i => i.productId.toString() === productId);
                            return total + (item ? item.price * item.quantity : 0);
                        }, 0)
                    };
                })
        );

        res.json({
            success: true,
            stats: {
                users: usersCount,
                products: productsCount,
                orders: ordersCount,
                revenue,
                pendingOrders,
                deliveredOrders,
                recentOrders,
                topProducts
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};