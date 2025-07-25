import Order from '../models/orderModel.js';
import { createNotification } from './notificationController.js';

export const createOrder = async (req, res) => {
  try {
    const { orderId, items, totalAmount, deliveryAddress } = req.body;

    if (!orderId || !items || !totalAmount || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const orderData = {
      orderId,
      userId: req.user?.id,
      items,
      totalAmount,
      deliveryAddress,
      status: 'Order Placed'
    };

    const order = new Order(orderData);
    await order.save();

    await createNotification(
      req.user.id,
      `Order #${orderId} has been created`,
      'order_placed',
      order._id
    );

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        eta: order.eta
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    // Map orders to include totalAmount for frontend
    const mappedOrders = orders.map(order => ({
      ...order.toObject(),
      totalAmount: order.totalAmount
    }));

    res.json({
      success: true,
      orders: mappedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history',
      error: error.message
    });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .select('status orderId eta');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      status: order.status,
      eta: order.eta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order status',
      error: error.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
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
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if it's a valid status transition
    const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const currentIndex = validStatuses.indexOf(order.status);
    const newIndex = validStatuses.indexOf(status);

    if (newIndex < currentIndex && status !== 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot revert to a previous status'
      });
    }

    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user.id,
      note: note || '',
      updatedAt: new Date()
    });

    await order.save();

    // Create notification for the user
    await createNotification(
      order.userId,
      `Your order #${order.orderId} is now ${status.toLowerCase()}`,
      'order_status',
      order._id
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.statusHistory[order.statusHistory.length - 1].updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    // Update order status to Cancelled
    order.status = 'Cancelled';
    await order.save();

    // Add notification for cancellation
    await createNotification(
      order.userId,
      `Your order #${order.orderId} has been cancelled`,
      'order_cancelled',
      order._id
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Error canceling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling order',
      error: error.message
    });
  }
};


export const searchOrders = async (req, res) => {
  try {
    const {
      query,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = -1,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (query) {
      filter.$or = [
        { orderId: { $regex: query, $options: 'i' } },
        { 'items.name': { $regex: query, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders: orders.map(order => ({
        ...order.toObject(),
        userName: order.userId?.name || 'Unknown User',
        userEmail: order.userId?.email || 'No Email'
      })),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Order search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search orders',
      error: error.message
    });
  }
};
