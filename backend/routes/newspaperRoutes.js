const express = require('express');
const router = express.Router();
const { getNewspaperImages, getImages, getPreviousNewspaperImages, getAvailableDates } = require('../controllers/newspaperController');

router.get('/images', getNewspaperImages);
router.get('/images/:id', getImages);
router.get('/previous-images/:date', getPreviousNewspaperImages);
router.get('/available-dates', getAvailableDates);

module.exports = router;