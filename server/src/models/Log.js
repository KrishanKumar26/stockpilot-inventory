const mongoose = require('mongoose');

// Activity Log & Notification Schema in MongoDB
const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'PRODUCT_CREATED',
        'PRODUCT_UPDATED',
        'PRODUCT_DELETED',
        'STOCK_ADJUSTED',
        'REORDER_TRIGGERED',
        'PO_STATUS_UPDATED',
        'ORDER_CREATED',
        'LOW_STOCK_ALERT',
        'SYSTEM_INIT',
        'USER_REGISTERED',
        'USER_LOGIN',
        'OTP_SENT',
        'OTP_VERIFIED',
        'PASSWORD_RESET_REQUESTED',
        'PASSWORD_RESET_SUCCESS',
        'USER_ROLE_UPDATED',
        'USER_DELETED',
        'SETTINGS_UPDATED'
      ]
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'Inventory'
    },
    metadata: {
      productId: Number,
      productName: String,
      sku: String,
      quantity: Number,
      poNumber: String,
      orderNumber: String
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'success'],
      default: 'info'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ActivityLog', logSchema);
