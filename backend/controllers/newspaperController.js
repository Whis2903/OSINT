const axios = require('axios');
const cheerio = require('cheerio');
const { format, subDays } = require('date-fns');
const { ObjectId } = require('mongodb');
const connectToDatabase = require('../db');

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
  'Connection': 'keep-alive',
  'Referer': 'https://www.google.com/',
  'Cache-Control': 'max-age=0',
  'Upgrade-Insecure-Requests': '1',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'DNT': '1'
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
  const db = await connectToDatabase();
  const collection = db.collection('Images');

  const result = await collection.insertOne({ imagesByNewspaper, date });

  console.log(`Stored images in MongoDB with ID: ${result.insertedId}`);
  return result.insertedId;
};

// Controller function to get images for the current date
const getNewspaperImages = async (req, res) => {
  const currentDate = getCurrentDate();
  const imagesByNewspaper = {};

  try {
    const db = await connectToDatabase();
    const collection = db.collection('Images');

    // Check if data for the current date already exists
    const existingDoc = await collection.findOne({ date: currentDate });

    if (existingDoc) {
      console.log(`Data for ${currentDate} already exists. Returning existing data.`);
      return res.json({ imageId: existingDoc._id });
    }

    // If data does not exist, perform scraping
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
  } catch (error) {
    console.error('Error getting newspaper images:', error);
    res.status(500).json({ message: 'An error occurred while getting newspaper images' });
  }
};

// Controller function to get images for a specific date from MongoDB
const getPreviousNewspaperImages = async (req, res) => {
  const { date } = req.params;

  try {
    const db = await connectToDatabase();
    const collection = db.collection('Images');

    const imageDoc = await collection.findOne({ date });

    if (imageDoc) {
      res.json(imageDoc.imagesByNewspaper);
    } else {
      res.status(404).json({ message: 'Images not found' });
    }
  } catch (error) {
    console.error('Error getting previous newspaper images:', error);
    res.status(500).json({ message: 'An error occurred while getting previous newspaper images' });
  }
};

// Controller function to get available dates from MongoDB
const getAvailableDates = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('Images');

    const dates = await collection.distinct('date');

    res.json(dates);
  } catch (error) {
    console.error('Error getting available dates:', error);
    res.status(500).json({ message: 'An error occurred while getting available dates' });
  }
};

// Controller function to get images from MongoDB
const getImages = async (req, res) => {
  const { id } = req.params;

  try {
    const db = await connectToDatabase();
    const collection = db.collection('Images');

    const imageDoc = await collection.findOne({ _id: new ObjectId(id) });

    if (imageDoc) {
      res.json(imageDoc.imagesByNewspaper);
    } else {
      res.status(404).json({ message: 'Images not found' });
    }
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ message: 'An error occurred while getting images' });
  }
};

module.exports = {
  getNewspaperImages,
  getPreviousNewspaperImages,
  getAvailableDates,
  getImages,
};