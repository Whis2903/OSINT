const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

const fetchYouTubeVideosByKeyword = async (req, res) => {
  const { keywords, limit = 10 } = req.query;
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: 'Keywords must be an array' });
  }

  try {
    const results = await Promise.all(
      keywords.map(async (keyword) => {
        const response = await youtube.search.list({
          part: 'snippet',
          q: keyword,
          maxResults: limit,
        });
        return response.data.items.map(item => ({
          title: item.snippet.title,
          description: item.snippet.description,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          publishedAt: item.snippet.publishedAt,
        }));
      })
    );

    // Flatten the results array and sort by date
    const flattenedResults = results.flat();
    const sortedResults = flattenedResults.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.json(sortedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  fetchYouTubeVideosByKeyword,
};