const express = require('express')
const router = express.Router();

//contoller import
const {fetchPostsByKeyword} = require('../controllers/redditController')


router.get('/posts/',fetchPostsByKeyword)

module.exports = router