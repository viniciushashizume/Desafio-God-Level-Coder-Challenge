const { subDays, startOfDay, endOfDay, subYears } = require('date-fns');

/**
 * Retorna o 'created_at' inicial com base no período.
 * @param {string} period - "7days", "30days", "90days", "year"
 */
function getStartDateFromPeriod(period) {
  const now = new Date();
  switch (period) {
    case '7days':
      // Inclui o dia de hoje, então -6
      return startOfDay(subDays(now, 6));
    case '30days':
      return startOfDay(subDays(now, 29));
    case '90days':
      return startOfDay(subDays(now, 89));
    case 'year':
      return startOfDay(subYears(now, 1));
    default:
      // Padrão para 7 dias
      return startOfDay(subDays(now, 6));
  }
}

/**
 * Aplica filtros comuns a uma query Knex.
 * @param {import('knex').Knex.QueryBuilder} qb - O construtor de query Knex.
 * @param {object} filters - O objeto de filtros do request.
 */
function applyBaseFilters(qb, filters) {
  const { period, channel, store } = filters;

  // 1. Filtro de Período
  // Nós sempre filtramos por um período para manter a performance.
  const startDate = getStartDateFromPeriod(period || '7days');
  const endDate = endOfDay(new Date());
  qb.whereBetween('sales.created_at', [startDate, endDate]);

  // 2. Filtro de Status (requisito do desafio)
  qb.where('sales.sale_status_desc', 'COMPLETED');

  // 3. Filtro de Canal (se não for "all")
  if (channel && channel !== 'all') {
    // Precisamos do join para filtrar pelo NOME do canal,
    // que é o que o frontend envia.
    qb.join('channels', 'sales.channel_id', 'channels.id');
    qb.where('channels.name', channel);
  }

  // 4. Filtro de Loja (se não for "all")
  if (store && store !== 'all') {
    // O frontend mockado tem "store1", "store2". O banco real tem nomes.
    // Vamos assumir que o frontend enviará o NOME da loja.
    qb.join('stores', 'sales.store_id', 'stores.id');
    qb.where('stores.name', store);
  }
}

module.exports = {
  applyBaseFilters,
  getStartDateFromPeriod,
};