require('dotenv').config();
const express = require('express');
const cors = require('cors');

const analyticsController = require('./controllers/analyticsController');
const metadataController = require('./controllers/metadataController');

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors()); // Permite requisições do seu frontend
app.use(express.json()); // Permite ler JSON do body

// Rotas da API
app.get('/api/v1/metadata/filters', metadataController.getFilters);
app.post('/api/v1/analytics/dashboard', analyticsController.getDashboardData);
app.get('/api/v1/analytics/products', analyticsController.getProductsPageData);
app.get('/api/v1/analytics/customers', analyticsController.getCustomersPageData);
app.post('/api/v1/analytics/operational', analyticsController.getOperationalData);

// Rota de "saúde"
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`🚀 Backend rodando na porta ${port}`);
});