// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});










//Feature 1 - Browse pages

/**
 * Select a page to display
 */
selectPage.addEventListener('change', async (event) => {
    const selectedPage = parseInt(event.target.value); // Get the selected page
    const deals = await fetchDeals(selectedPage, currentPagination.size); // Fetch deals for the selected page

    setCurrentDeals(deals); // Update global data
    render(currentDeals, currentPagination); // Render the updated data
});

/**
 * Handle changes in the number of deals displayed per page
 */
selectShow.addEventListener('change', async (event) => {
    const size = parseInt(event.target.value); // New number of deals per page
    const totalPages = Math.ceil(currentPagination.count / size); // Recalculate total number of pages
    const newPage = Math.min(currentPagination.currentPage, totalPages); // Adjust current page if it exceeds total pages

    if (newPage !== currentPagination.currentPage) {
        alert(`The current page exceeds the total number of pages. Redirecting to page ${newPage}.`);
    }

    const deals = await fetchDeals(newPage, size); // Fetch deals with new page size

    setCurrentDeals(deals); // Update global data
    render(currentDeals, currentPagination); // Render the updated data
});


//Feature 2 - Filter by best discount


/**
 * Filter deals by best discount (discount > 50%)
 * @param {Array} deals - All deals to filter
 * @return {Array} - Filtered deals
 */
const filterByBestDiscount = (deals) => {
    return deals.filter(deal => deal.discount > 50);
};

// Add an event listener to the "By Best Discount" checkbox
const bestDiscountCheckbox = document.querySelector('#best-discount');

// Keep track of the best discount filter state
let isBestDiscountEnabled = false;

bestDiscountCheckbox.addEventListener('change', async (event) => {
    isBestDiscountEnabled = event.target.checked; // Update the filter state

    const deals = await fetchDeals(1, currentPagination.size); // Fetch the first page with the selected size
    const filteredDeals = isBestDiscountEnabled
        ? filterByBestDiscount(deals.result)
        : deals.result;

    // Update global state and re-render
    setCurrentDeals({ result: filteredDeals, meta: currentPagination });
    render(currentDeals, currentPagination);
});

// Handle page changes while keeping the filter active
selectPage.addEventListener('change', async (event) => {
    const selectedPage = parseInt(event.target.value); // Get the selected page number
    const deals = await fetchDeals(selectedPage, currentPagination.size);

    const filteredDeals = isBestDiscountEnabled
        ? filterByBestDiscount(deals.result)
        : deals.result;

    // Update global state and re-render
    setCurrentDeals({ result: filteredDeals, meta: currentPagination });
    render(currentDeals, currentPagination);
});

// Handle size changes while keeping the filter active
selectShow.addEventListener('change', async (event) => {
    const selectedSize = parseInt(event.target.value); // Get the selected size
    const deals = await fetchDeals(1, selectedSize); // Always reset to page 1 when size changes

    const filteredDeals = isBestDiscountEnabled
        ? filterByBestDiscount(deals.result)
        : deals.result;

    // Update global state and re-render
    setCurrentDeals({ result: filteredDeals, meta: currentPagination });
    render(currentDeals, currentPagination);
});



document.addEventListener('DOMContentLoaded', async () => {
    const deals = await fetchDeals();

    setCurrentDeals(deals);
    render(currentDeals, currentPagination);
});





