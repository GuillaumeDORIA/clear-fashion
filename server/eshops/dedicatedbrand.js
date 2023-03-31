const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://www.dedicatedbrand.com/en/men/all-men#page=';

const parseData = (data) => {
  const $ = cheerio.load(data);

  return $('.productList-container .productList')
    .map((i, element) => {
      const brand = "Dedicated";
      const name = $(element)
        .find('.productList-title')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      const title = $(element)
        .find('.productList-title')
        .text()
        .trim();
      const color = title.split(' ').pop();
      const price = parseFloat(
        $(element)
          .find('.productList-price')
          .text()
      );

      return { brand, name, price, color };
    })
    .get();
};

const fetchData = async (url) => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parseData(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const scrapePages = async (startPage, endPage) => {
  const allProducts = [];

  for (let i = startPage; i <= endPage; i++) {
    const url = BASE_URL + i;
    console.log(`🕵️‍♀️  browsing ${url}`);

    const products = await fetchData(url);

    if (products && products.length > 0) {
      allProducts.push(...products);
    } else {
      break;
    }
  }

  return allProducts;
};

const writeDataToFile = async () => {
  try {
    const scrapedData = await scrapePages(1, 17);
    console.log(scrapedData);

    const jsonData = JSON.stringify(scrapedData);
    fs.writeFile('dedicated_products.json', jsonData, (err) => {
      if (err) throw err;
      console.log('Data written to file-------');
    });
  } catch (error) {
    console.error(error);
  }
};

writeDataToFile();
