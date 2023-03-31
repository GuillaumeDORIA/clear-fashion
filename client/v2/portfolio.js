// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/
Search for specific products
This endpoint accepts the following optional query string parameters:
- `page` - page of products to return
- `size` - number of products to return
GET https://clear-fashion-api.vercel.app/brands
Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand = document.querySelector('#brand-select');
const spanNbBrands = document.querySelector('#nbBrands');
const selectReleased = document.querySelector('#released-select');
const selectPrice = document.querySelector('#price-select');
const selectSort = document.querySelector('#sort-select');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
//var selectFavorite = document.querySelector('#cb${counter}');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://server-api.vercel.app/?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  var counter = 0;
  const template = products
    .map(product => {
      counter++;
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}</span>
        <input id="cb${counter}" class="star" type="checkbox" title="bookmark page" checked>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
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
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://server-api.vercel.app/brands`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data.result;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

const renderBrands = async() => {
  const brandsname = await fetchBrands();
  spanNbBrands.innerHTML = brandsname.length;
  brandsname.unshift('All');
  const options = Array.from(brandsname,
    (brand => `<option value="${brand}">${brand}</option>`)
  ).join('');
    
  selectBrand.innerHTML = options;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/** Feature 0 - Show more
As a user
I want to show more products
So that I can display 12, 24 or 48 products on the same page
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



/**Feature 1 - Browse pages
As a user
I want to browse available pages
So that I can load more products 
 * Select the page to display */

selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/** Feature 2 - Filter by brands
As a user
I want to filter by brands name
So that I can browse product for a specific brand */
selectBrand.addEventListener('change', async (event) => {
  const products = await fetchProducts(1,currentPagination.count);
  
  if(event.target.value != 'all'){
    products.result = products.result.filter(product => product.brand == event.target.value);
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/** Feature 3 - Filter by recent products
As a user
I want to filter by by recent products
So that I can browse the new released products (less than 2 weeks) */
selectReleased.addEventListener('click', async (event) => {
  const products = await fetchProducts(1,currentPagination.count);
  const today = new Date();
  const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
  products.result = products.result.filter(product => {
    const date = new Date(product.released);
    return date > twoWeeksAgo;
  });

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/**
Feature 4 - Filter by reasonable price
As a user
I want to filter by reasonable price
So that I can buy affordable product i.e less than 50€ */
selectPrice.addEventListener('click', async (event) => {
  const products = await fetchProducts(1,currentPagination.count);
  products.result = products.result.filter(product => product.price < 50);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/** 
Feature 5 - Sort by price
As a user
I want to sort by price
So that I can easily identify cheapest and expensive products 
AND
Feature 6 - Sort by date
As a user
I want to sort by price
So that I can easily identify recent and old products */
selectSort.addEventListener('change', async (event) => {
  const products = await fetchProducts(1,currentPagination.count);
  if(event.target.value == 'price-asc'){
    products.result.sort((a, b) => a.price - b.price);
  } else if(event.target.value == 'price-desc'){
    products.result.sort((a, b) => b.price - a.price);
  }
  else if(event.target.value == 'date-asc'){
    products.result.sort((a, b) => new Date(a.released) - new Date(b.released));
  } else if(event.target.value == 'date-desc'){
    products.result.sort((a, b) => new Date(b.released) - new Date(a.released));
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

/**
Feature 8 - Number of products indicator
As a user
I want to indicate the total number of products
So that I can understand how many products is available */
/** It's already done in renderIndicator
*/

/*
Feature 9 - Number of recent products indicator
As a user
I want to indicate the total number of recent products
So that I can understand how many new products are available */
function getRecentProducts(products){
  const today = new Date();
  const twoWeeksAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
  const recentProducts = products.filter(product => {
    const date = new Date(product.released);
    return date > twoWeeksAgo;
  });
  return recentProducts.length;
}

const renderNewProductsIndicator = async() => {
  const products = await fetchProducts(1,currentPagination.count);
  const recentProducts = getRecentProducts(products.result);
  spanNbNewProducts.innerHTML = recentProducts;
};

/**
Feature 10 - p50, p90 and p95 price value indicator
As a user
I want to indicate the p50, p90 and p95 price value
So that I can understand the price values of the products */
const quantile = (arr, q,attribute) => {
  const sorted = arr.slice().sort((a, b) => a - b);
  const pos = (sorted.length-1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if ((sorted[base + 1][attribute] !== undefined)) {
    return Math.round(sorted[base][attribute] + rest * (sorted[base + 1][attribute] - sorted[base][attribute]));
  } else {
    return Math.round(sorted[base][attribute]);
  }
};

/**
Feature 11 - Last released date indicator
As a user
I want to indicate the last released date
So that I can understand if we have new products */
const getLastReleasedDate = products => {
  const sorted = products.slice().sort((a, b) => {
    const dateA = new Date(a.released);
    const dateB = new Date(b.released);
    return dateB - dateA;
  });
  return sorted[0].released;
};

/**
Feature 12 - Open product link
As a user
I want to open product link in a new page
So that I can buy the product easily 
We just have to add target="_blank" in the html
*/

/**
Feature 13 - Save as favorite
As a user
I want to save a product as favorite
So that I can retreive this product later */
const saveFavorite = async (id) => {
  const products = await fetchProducts(1,currentPagination.count);
  const product = products.result.find(product => product.id == id);
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.push(product);
  localStorage.setItem('favorites', JSON.stringify(favorites));
};

function setupFavoriteButton() {
  const buttons = document.querySelectorAll('.star');
  buttons.forEach(button => {
    button.addEventListener('click', (event) => {
      const id = event.target.dataset.id;
      saveFavorite(id);
    });
  });
}
