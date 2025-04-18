const express = require('express');
const router = express.Router();

router.use('/reddit', require('./redditRoutes'));
router.use('/youtube', require('./youtubeRoutes'));
router.use('/google', require('./googleRoutes'));
router.use('/news', require('./newsRoutes'));
router.use('/newspaper', require('./newspaperRoutes')); // Add this line

module.exports = router;