require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  pool: { min: 2, max: 10 },
});

// Testa a conexão
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso.');
  })
  .catch((e) => {
    console.error('❌ Falha ao conectar com o PostgreSQL:');
    console.error(e.message);
  });

module.exports = db;