const express = require('express');
const router = express.Router();
const { searchGoogle } = require('../controllers/googleController');

router.get('/search', searchGoogle);

module.exports = router;