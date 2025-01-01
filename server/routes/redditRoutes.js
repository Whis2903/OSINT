const express = require('express');
const { searchSubreddits, searchPostsInSubreddit, fetchPostsByKeyword } = require('../controllers/redditController');
const router = express.Router();

router.get('/posts', fetchPostsByKeyword);

module.exports = router;