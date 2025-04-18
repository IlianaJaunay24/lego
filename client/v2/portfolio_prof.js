'use strict';

let currentDeals = [];
let currentPagination = {};
let currentPage = 1;

const selectSort = document.querySelector('#sort-select');
const sectionDeals = document.querySelector('#deals');
const btnPrev = document.querySelector('#prev-page');
const btnNext = document.querySelector('#next-page');

const checkBestDiscount = document.querySelector('#best-discount');
const checkLowPercentile = document.querySelector('#low-percentile');
const checkHighProfit = document.querySelector('#high-profit');

const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

const fetchDeals = async (page = 1, size = 12) => {
  try {
    const response = await fetch(`https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`);
    const body = await response.json();
    if (body.success !== true) {
      console.error(body);
      return { result: [], meta: {} };
    }
    return body.data;
  } catch (error) {
    console.error(error);
    return { result: [], meta: {} };
  }
};

const fetchSalesStats = async legoId => {
  try {
    const response = await fetch(`https://lego-api-blue.vercel.app/sales?id=${legoId}`);
    const body = await response.json();
    if (!body.success || !body.data?.result) return null;

    const prices = body.data.result
      .map(item => parseFloat(item.price))
      .filter(p => !isNaN(p));

    if (!prices.length) return null;

    prices.sort((a, b) => a - b);
    const p20 = prices[Math.floor(prices.length * 0.2)];
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      avg,
      p20,
      nbSales: prices.length
    };
  } catch (err) {
    console.error(`Erreur ventes pour ${legoId}`, err);
    return null;
  }
};

const enrichDealsWithProfit = async deals => {
  return Promise.all(deals.map(async deal => {
    const idToUse = deal.lego_id ?? deal.id;
    const stats = await fetchSalesStats(idToUse);

    if (stats) {
      deal.avgSalePrice = stats.avg.toFixed(2);
      deal.profit = (stats.avg - deal.price).toFixed(2);
      deal.p20 = stats.p20.toFixed(2);
      deal.nbSales = stats.nbSales;
    }

    return deal;
  }));
};

const sortDeals = (deals, criterion) => {
  switch (criterion) {
    case 'price-asc':
      return deals.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return deals.sort((a, b) => b.price - a.price);
    case 'profit-desc':
      return deals.sort((a, b) => (parseFloat(b.profit) || 0) - (parseFloat(a.profit) || 0));
    case 'score-desc':
      return deals.sort((a, b) => (b.temperature || 0) - (a.temperature || 0));
    default:
      return deals;
  }
};

const applyFilters = deals => {
  return deals.filter(deal => {
    const discountCondition = !checkBestDiscount.checked || deal.discount > 50;
    const percentileCondition = !checkLowPercentile.checked || (deal.p20 && parseFloat(deal.p20) <= 25);
    const profitCondition = !checkHighProfit.checked || (deal.profit && parseFloat(deal.profit) >= 10);
    return discountCondition && percentileCondition && profitCondition;
  });
};

const renderDeals = (deals, pagination) => {
  const div = document.createElement('div');
  const filteredDeals = applyFilters(deals);
  const nbDealsOnPage = filteredDeals.length;

  const template = filteredDeals.map(deal => {
    const isHot = deal.discount > 50;
    const isProfit = deal.profit && parseFloat(deal.profit) >= 10;

    return `
      <div class="deal" id="${deal.uuid}">
        <img class="deal-image" src="${deal.photo ?? 'https://via.placeholder.com/140'}" alt="${deal.title}">
        <div class="deal-info">
          <h3 class="deal-title"><a href="${deal.link}" target="_blank">${deal.title}</a></h3>
          <p><strong>ID:</strong> ${deal.id}</p>
          <p><strong>Price:</strong> ${deal.price} €</p>
          <p><strong>Discount:</strong> ${deal.discount ?? 0} % ${isHot ? '<span class="badge badge-hot">🔥 HOT</span>' : ''}</p>
          <p><strong>Temperature:</strong> ${deal.temperature ?? 'N/A'}°</p>
          <p><strong>Avg Sale Price:</strong> ${deal.avgSalePrice ?? 'N/A'} €</p>
          <p><strong>Profit:</strong> ${deal.profit ?? 'N/A'} € ${isProfit ? '<span class="badge badge-profit">💰 PROFIT</span>' : ''}</p>
          <p><strong>Nb Sales:</strong> ${deal.nbSales ?? 0}</p>
          <p><strong>20e Percentile:</strong> ${deal.p20 ?? 'N/A'} €</p>
        </div>
      </div>
    `;
  }).join('');

  div.innerHTML = template;
  sectionDeals.innerHTML = `<h2>Deals <span class="badge badge-count">${nbDealsOnPage} shown</span></h2>`;
  sectionDeals.appendChild(div);

  btnPrev.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= (pagination.pageCount || 1);
};

const render = async (deals, pagination) => {
  renderDeals(deals, pagination);
};

const reload = async () => {
  const raw = await fetchDeals(currentPage, 12);
  const enriched = await enrichDealsWithProfit(raw.result);
  const sorted = sortDeals([...enriched], selectSort.value);
  setCurrentDeals({ result: sorted, meta: raw.meta });
  await render(sorted, raw.meta);
};

btnPrev.addEventListener('click', async () => {
  if (currentPage > 1) {
    currentPage--;
    await reload();
  }
});

btnNext.addEventListener('click', async () => {
  currentPage++;
  await reload();
});

selectSort.addEventListener('change', async () => {
  await render(currentDeals, currentPagination);
});

// Ajout écouteurs sur checkboxes pour actualiser l'affichage
[checkBestDiscount, checkLowPercentile, checkHighProfit].forEach(checkbox =>
  checkbox.addEventListener('change', () => render(currentDeals, currentPagination))
);

document.addEventListener('DOMContentLoaded', async () => {
  currentPage = 1;
  await reload();
});
