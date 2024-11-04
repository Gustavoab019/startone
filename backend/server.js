const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
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
const cors = require('cors');



dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add user routes
app.use(cors({
  origin: 'http://localhost:3000',  // Permitir apenas requisições deste domínio
  credentials: true,  // Se você estiver usando cookies para autenticação
}));
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
