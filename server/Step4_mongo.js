const {MongoClient, ObjectId} = require('mongodb');
var MONGODB_URI = 'mongodb+srv://danyock2:danyock2@clearfashion.dsvhkak.mongodb.net/?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashionDB';
const MONGODB_COLLECTION = 'clearfashionC';
const fs = require('fs');
var collection = null;


async function connectMongoDb() {
  console.log('Connecting to MongoDB...');
  const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });
  const db = client.db(MONGODB_DB_NAME);
  collection = db.collection(MONGODB_COLLECTION);
  console.log('Connection established successfully');
}

async function insertProductsMongoDB() {
  await connectMongoDb();
  console.log('Inserting products into the MongoDB database...');
  const productsToInsert = JSON.parse(fs.readFileSync('all_products.json'));
  const insertedProducts = await collection.insertMany(productsToInsert);
  console.log(`${insertedProducts.insertedCount} Products were inserted Successfully`);
}

async function fetchByBrand(brand = 'Dedicated') {
  await connectMongoDb();
  console.log(`Fetching products from ${brand} brand...`);
  const products = await collection.find({ brand }).toArray();
  console.log(products);
  process.exit(0);
}

async function fetchbyID(id = '64189c74d4e7c9e8a1df3252') {
  await connectMongoDb();
  console.log(`Fetching product by ID ${id}...`);
  const products = await collection.findOne({ _id: ObjectId(id) });
  console.log(products);
  process.exit(0);
}

async function fetchProductsCheaperThanPrice(price = 30) {
  await connectMongoDb();
  console.log(`Fetching products cheaper than ${price}...`);
  const products = await collection.find({ price: { $lt: price } }).toArray();
  console.log(products);
  process.exit(0);
}

/* We had to choose 3 out of 5 methods to write, which were :
Find all products related to a given brands
Find all products less than a price
Find all products sorted by price
Find all products sorted by date
Find all products scraped less than 2 weeks

I decided to write the follwing :
Find all products sorted by price
Find all products sorted by date
Find all products scraped less than 2 weeks
*/

async function fetchProductsSortedByPrice() {
  await connectMongoDb();
  console.log('Fetching products sorted by price...');
  const products = await collection.find().sort({ price: 1 }).toArray();
  console.log(products);
  process.exit(0);
}

async function fetchProductsSortedByDate() {
  await connectMongoDb();
  console.log('Fetching products sorted by date...');
  const products = await collection.find().sort({ date: -1 }).toArray();
  console.log(products);
  process.exit(0);
}

async function fetchProductsLessThan2Weeks() {
  await connectMongoDb();
  const twoWeeksAgo = new Date(Date.now() - (1000 * 60 * 60 * 24 * 14));
  console.log(`Fetching products with scraping date less than ${twoWeeksAgo.toLocaleDateString()}...`);
  const products = await collection.find({ date: { $lte: twoWeeksAgo } }).toArray();
  console.log(products);
  process.exit(0);
}
