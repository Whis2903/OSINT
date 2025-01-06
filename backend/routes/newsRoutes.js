const express = require('express');
const { searchNews } = require('../controllers/newsController');

const router = express.Router();

router.get('/search', searchNews);

module.exports = router;