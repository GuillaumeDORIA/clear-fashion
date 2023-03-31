const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs/promises');

const BASE_URL = 'https://shop.circlesportswear.com/collections/collection-homme?page=';

const parseProduct = (element) => {
  const brandName = 'Circle Sportswear';
  const productName = $('h3.card__heading a', element)
    .first()
    .text()
    .trim()
    .replace(/\s+/g, ' ');
  const colors = $('.color-variant', element)
    .map((_, e) => $(e).attr('data-color'))
    .get();
  const priceText = $(element)
    .find('.money')
    .first()
    .text();
  const priceRegex = /[+-]?\d+(\.\d+)?/g;
  const extractedPrices = priceText.match(priceRegex);
  const price = extractedPrices ? parseFloat(extractedPrices[0]) : null;
  return price !== null ? { brand: brandName, name: productName, colors, price } : null;
};

const parsePage = (data) => {
  const $ = cheerio.load(data);
  const products = $('.grid__item').map((i, element) => parseProduct(element)).get();
  return products.filter(product => product !== null);
};

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(response);
      return [];
    }
    const body = await response.text();
    return parsePage(body);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const scrapePages = async (startPage, endPage) => {
  const products = [];
  for (let page = startPage; page <= endPage; page++) {
    const url = `${BASE_URL}${page}`;
    console.log(`🕵️‍♀️  browsing ${url}`);
    const scrapedProducts = await fetchData(url);
    if (scrapedProducts.length === 0) break;
    products.push(...scrapedProducts);
  }
  return products;
};

const writeDataToFile = async (fileName, data) => {
  try {
    const jsonData = JSON.stringify(data);
    await fs.writeFile(fileName, jsonData);
    console.log('Data written to file');
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  const startPage = 1;
  const endPage = 1;
  const scrapedData = await scrapePages(startPage, endPage);
  console.log(scrapedData);
  await writeDataToFile('cs_products.json', scrapedData);
})();
