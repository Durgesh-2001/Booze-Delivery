import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order_status', 'payment_status', 'order_placed', 'order_delivered', 'order_cancelled'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;