const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  products: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    },
    name: String,
    price: Number,
    quantity: { 
      type: Number, 
      required: true, 
      min: 1 
    }
  }],
  total: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);