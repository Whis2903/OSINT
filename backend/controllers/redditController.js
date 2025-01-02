const snoowrap = require('snoowrap');
const dotenv = require('dotenv');

dotenv.config();

const reddit = new snoowrap({
  userAgent: 'osint-mern-app',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});

const fetchPostsByKeyword = async (req, res) => {
  try {
    const { keyword, subreddit = 'all', limit = 10 } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const posts = [];
    const submissions = await reddit.getSubreddit(subreddit).search({ query: keyword, limit });
    submissions.forEach(submission => {
      posts.push({
        title: submission.title,
        url: submission.url,
        content: submission.selftext || 'No text content',
        post_type: submission.is_self ? 'Self-post' : 'Link or Media',
        comments_count: submission.num_comments,
      });
    });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchPostsByKeyword,
};