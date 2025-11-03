const metadataService = require('../services/metadataService');

async function getFilters(req, res) {
  try {
    const data = await metadataService.getFilterOptions();
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar metadados dos filtros:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

module.exports = {
  getFilters,
};