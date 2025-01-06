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
  const { keywords, subreddit = 'all', limit = 10 } = req.query;
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: 'Keywords must be an array' });
  }

  try {
    const results = await Promise.all(
      keywords.map(async (keyword) => {
        const submissions = await reddit.getSubreddit(subreddit).search({ query: keyword, limit });
        return submissions.map(submission => ({
          title: submission.title,
          url: submission.url,
          content: submission.selftext || 'No text content',
          post_type: submission.is_self ? 'Self-post' : 'Link or Media',
          comments_count: submission.num_comments,
          created_utc: submission.created_utc,
        }));
      })
    );

    // Flatten the results array and sort by date
    const flattenedResults = results.flat();
    const sortedResults = flattenedResults.sort((a, b) => b.created_utc - a.created_utc);

    res.json(sortedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchPostsByKeyword,
};