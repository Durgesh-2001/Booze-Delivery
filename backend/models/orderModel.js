import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  note: String
});

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  size: {
    type: String,
    default: '750ml'
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Placed'
  },
  eta: {
    type: Date,
    default: null
  },
  statusHistory: [statusHistorySchema],
  deliveryAddress: {
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    }
  }
}, {
  timestamps: true
});

orderSchema.methods.updateStatus = async function(newStatus, userId) {
  const validStatuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid order status');
  }

  const currentIndex = validStatuses.indexOf(this.status);
  const newIndex = validStatuses.indexOf(newStatus);

  if (newIndex < currentIndex) {
    throw new Error('Cannot revert order status to a previous state');
  }

  this.statusHistory.push({
    status: newStatus,
    updatedBy: userId,
    note: note
  });

  this.status = newStatus;

  // ETA logic
  if (newStatus === 'Delivered') {
    this.eta = null;
  } else {
    this.eta = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  }

  return await this.save();
};

orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status })
    .populate('userId', 'name email')
    .populate('statusHistory.updatedBy', 'name email')
    .sort({ createdAt: -1 });
};

orderSchema.virtual('progressPercentage').get(function() {
  const statuses = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentIndex = statuses.indexOf(this.status);
  return ((currentIndex + 1) / statuses.length) * 100;
});

orderSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
