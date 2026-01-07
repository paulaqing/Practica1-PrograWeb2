const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { 
    type: String, 
    required: true 
  }, // ID del chat (ej: "admin-user123")
  sender: { 
    type: String, 
    required: true 
  }, // Username del que envía
  message: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Índice para buscar mensajes por sala eficientemente
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);