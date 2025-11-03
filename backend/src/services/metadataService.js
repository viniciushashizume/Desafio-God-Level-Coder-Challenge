const db = require('../database');

async function getFilterOptions() {
  // Usamos Promise.all para buscar ambos em paralelo
  const [stores, channels] = await Promise.all([
    // CORREÇÃO: Agrupa por nome para garantir lojas únicas
    db('stores')
      .select('name')
      .min('id as id') // Pega o primeiro ID para usar como chave
      .groupBy('name')
      .orderBy('name'),
    
    // CORREÇÃO: Agrupa por nome para garantir canais únicos
    db('channels')
      .select('name')
      .min('id as id') // Pega o primeiro ID para usar como chave
      .groupBy('name')
      .orderBy('name'),
  ]);

  return {
    stores,
    channels,
  };
}

module.exports = {
  getFilterOptions,
};