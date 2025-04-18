const axios = require('axios');
const cheerio = require('cheerio');
const { format, subDays } = require('date-fns');
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'newspaperDB';
const collectionName = 'newspaperImages';

// List of base URLs for newspapers
const baseUrls = [
  "https://jammukashmirtimes.com",
  "https://dailykhabarnamaint.com",
  "https://subhenoe.com",
  "https://siasat.com.pk"
];

// Headers for HTTP requests
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive'
};

// Function to get the current date in DD-MM-YYYY format
const getCurrentDate = () => {
  return format(new Date(), 'dd-MM-yyyy');
};

// Function to get a previous date in DD-MM-YYYY format
const getPreviousDate = (daysAgo) => {
  return format(subDays(new Date(), daysAgo), 'dd-MM-yyyy');
};

// Function to scrape images
const scrapeImages = async (baseUrl, date) => {
  const url = `${baseUrl}/${date}/`;
  console.log(`Scraping URL: ${url}`);

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const table = $('table');

    if (!table.length) {
      console.log(`No table found on the page: ${url}`);
      return [];
    }

    const anchors = table.find('a');
    const imageUrls = anchors
      .map((i, anchor) => $(anchor).attr('href'))
      .get()
      .filter(href => href && (href.endsWith('.jpg') || href.endsWith('.png') || href.endsWith('.jpeg')));

    if (!imageUrls.length) {
      console.log(`No images found in the table on page: ${url}`);
      return [];
    }

    console.log(`Found ${imageUrls.length} images on ${url}`);
    return imageUrls;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return [];
  }
};

// Function to store images in MongoDB
const storeImagesInMongoDB = async (imagesByNewspaper, date) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const result = await collection.insertOne({ imagesByNewspaper, date });

  console.log(`Stored images in MongoDB with ID: ${result.insertedId}`);
  return result.insertedId;
};

// Controller function to get images for the current date
const getNewspaperImages = async (req, res) => {
  const currentDate = getCurrentDate();
  const imagesByNewspaper = {};

  for (const baseUrl of baseUrls) {
    console.log(`Processing website: ${baseUrl}`);
    const imageUrls = await scrapeImages(baseUrl, currentDate);
    imagesByNewspaper[baseUrl] = imageUrls;
  }

  if (Object.keys(imagesByNewspaper).length > 0) {
    const imageId = await storeImagesInMongoDB(imagesByNewspaper, currentDate);
    res.json({ imageId });
  } else {
    res.status(404).json({ message: 'No images found' });
  }
};

// Controller function to get images for a specific date from MongoDB
const getPreviousNewspaperImages = async (req, res) => {
  const { date } = req.params;

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const imageDoc = await collection.findOne({ date });

  if (imageDoc) {
    res.json(imageDoc.imagesByNewspaper);
  } else {
    res.status(404).json({ message: 'Images not found' });
  }
};

// Controller function to get available dates from MongoDB
const getAvailableDates = async (req, res) => {
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const dates = await collection.distinct('date');

  res.json(dates);
};

// Controller function to get images from MongoDB
const getImages = async (req, res) => {
  const { id } = req.params;

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const imageDoc = await collection.findOne({ _id: new ObjectId(id) });

  if (imageDoc) {
    res.json(imageDoc.imagesByNewspaper);
  } else {
    res.status(404).json({ message: 'Images not found' });
  }
};

module.exports = {
  getNewspaperImages,
  getPreviousNewspaperImages,
  getAvailableDates,
  getImages,
};