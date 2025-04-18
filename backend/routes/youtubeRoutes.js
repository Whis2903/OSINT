const express = require('express');
const { fetchYouTubeVideosByKeyword } = require('../controllers/youtubeController');

const router = express.Router();

router.get('/videos', fetchYouTubeVideosByKeyword);

module.exports = router;