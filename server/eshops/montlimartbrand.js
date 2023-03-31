const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs/promises');

const scrapeProducts = async (url) => {
  const products = [];

  try {
    const response = await fetch(url);

    if (response.ok) {
      const htmlText = await response.text();
      const $ = cheerio.load(htmlText);

      $('.product-miniature').each((index, element) => {
        const brand = "Montlimart";
        const name = $(element)
          .find('.product-miniature__title')
          .text()
          .trim()
          .toLowerCase()
          .replace(/^\w/, capitalize);
        const price = parseFloat($(element)
          .find('.price')
          .text()
          .replace(',', '.'));
        const color = $(element)
          .find('.product-miniature__color')
          .text()
          .trim()
          .toLowerCase()
          .replace(/^\w/, capitalize);

        products.push({ brand, name, price, color });
      });
    } else {
      console.error(`Error fetching products. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error scraping products: ${error}`);
  }

  return products;
};

(async () => {
  try {
    const montlimartProducts = await scrapeProducts('https://www.montlimart.com/99-vetements');
    console.log(montlimartProducts);

    const jsonData = JSON.stringify(montlimartProducts, null, 2);

    await fs.writeFile('montlimart_products.json', jsonData);
    console.log('Data written to file');
  } catch (error) {
    console.error(error);
  }
})();

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
