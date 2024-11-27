const express = require('express');
const http = require('http'); // Importa o módulo HTTP
const socketIo = require('socket.io'); // Importa o Socket.IO
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const companyPanelRoutes = require('./routes/companyPanelRoutes');
const companyRoutes = require('./routes/companyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const VehicleRoutes = require('./routes/vehicleRoutes')

dotenv.config();

const app = express();
const server = http.createServer(app); // Cria o servidor HTTP
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Permitir apenas requisições do frontend
    methods: ['GET', 'POST']
  }
});

// Conecta ao MongoDB
connectDB();

// Middleware para parse de JSON e CORS
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Permitir requisições do frontend
  credentials: true, // Para autenticação com cookies
}));

// Rota básica
app.get('/', (req, res) => {
  res.send('API is running');
});

// Configura o Socket.IO para emitir eventos
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Salva o Socket.IO na aplicação para acesso nas rotas
app.set('socketio', io);

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/company', companyPanelRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/participants', evaluationRoutes);
app.use('/api/vehicles', VehicleRoutes);

// Porta do servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
