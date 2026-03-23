const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// 🔐 Variables de entorno
const { PORT, JWT_SECRET, MONGO_URI } = require('./config');

// GraphQL
const schema = require('./graphql/schema');
const rootResolver = require('./graphql/resolvers');

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ====== Configuración del servidor ======
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// ====== Middleware global ======
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Servir estáticos también en /api para que funcionen las rutas construidas en el frontend (/api/uploads/...)
app.use('/api', express.static(path.join(__dirname, 'public')));

// ====== Conexión a MongoDB ======
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error al conectar MongoDB:', err));

// ====== GraphQL Endpoint ======
app.use('/graphql', graphqlHTTP((req) => {
  const token = req.headers.authorization?.split(' ')[1] || '';
  let user = null;
  
  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      user = null;
    }
  }

  return {
    schema: schema,
    rootValue: rootResolver,
    context: { user },
    graphiql: true,
  };
}));

console.log('🚀 GraphQL disponible en http://localhost:' + PORT + '/graphql');

// ====== Rutas REST ======
app.use('/', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// ====== CHAT EN TIEMPO REAL CON PERSISTENCIA ======
const Message = require('./models/Message');
const User = require('./models/User');

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Token no proporcionado'));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Token inválido'));
  }
});

io.on('connection', async (socket) => {
  const username = socket.user?.username || 'Anónimo';
  const isAdmin = socket.user?.role === 'admin';
  
  console.log(`🟢 ${username} (${socket.user.role}) conectado al chat`);

  // Enviar lista de usuarios disponibles
  socket.on('getAvailableUsers', async () => {
    try {
      // Obtener TODOS los usuarios excepto el actual
      const users = await User.find({ 
        username: { $ne: username } 
      }).select('username role');
      
      socket.emit('availableUsers', users.map(u => ({
        username: u.username,
        role: u.role
      })));
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
    }
  });

  // Unirse a una sala de chat
  socket.on('joinRoom', async (room) => {
    socket.join(room);
    socket.currentRoom = room;
    
    // Cargar historial de últimos 50 mensajes
    try {
      const history = await Message.find({ room })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      
      socket.emit('messageHistory', history.reverse().map(m => ({
        name: m.sender,
        msg: m.message,
        timestamp: new Date(m.timestamp).toLocaleTimeString()
      })));
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  });

  // Enviar mensaje
  socket.on('chatmessage', async (data) => {
    if (!data || !data.message || !data.room) return;

    const messageData = {
      name: username,
      msg: data.message,
      timestamp: new Date().toLocaleTimeString()
    };

    // Guardar en BD
    try {
      const newMessage = new Message({
        room: data.room,
        sender: username,
        message: data.message,
        timestamp: new Date()
      });
      await newMessage.save();

      // Mantener solo últimos 50 mensajes por sala
      const count = await Message.countDocuments({ room: data.room });
      if (count > 50) {
        const toDelete = await Message.find({ room: data.room })
          .sort({ createdAt: 1 })
          .limit(count - 50)
          .select('_id');
        await Message.deleteMany({ _id: { $in: toDelete.map(m => m._id) } });
      }
    } catch (err) {
      console.error('Error al guardar mensaje:', err);
    }

    // Emitir a todos en la sala
    io.to(data.room).emit('chatmessage', messageData);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 ${username} desconectado del chat`);
  });
});

// ====== ARRANQUE DEL SERVIDOR ======
server.listen(PORT, () => {
  console.log(`🚀 Servidor Express en puerto ${PORT}`);
});