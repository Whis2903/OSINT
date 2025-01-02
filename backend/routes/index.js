const express = require('express');
const redditRoutes = require('./redditRoutes');
const router = express.Router();


router.use('/reddit', redditRoutes);

module.exports = router;