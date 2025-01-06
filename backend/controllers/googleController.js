const axios = require('axios');

const GOOGLE_CUSTOM_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_CUSTOM_SEARCH_API_KEY = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
const GOOGLE_CUSTOM_SEARCH_ENGINE_ID = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

const searchGoogle = async (req, res) => {
  const { keywords } = req.query;
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: 'Keywords must be an array' });
  }

  try {
    const results = await Promise.all(
      keywords.map(async (keyword) => {
        const response = await axios.get(GOOGLE_CUSTOM_SEARCH_API_URL, {
          params: {
            key: GOOGLE_CUSTOM_SEARCH_API_KEY,
            cx: GOOGLE_CUSTOM_SEARCH_ENGINE_ID,
            q: keyword,
          },
        });
        return response.data.items;
      })
    );

    // Flatten the results array and sort by date
    const flattenedResults = results.flat();
    const sortedResults = flattenedResults.sort((a, b) => {
      const dateA = a.pagemap?.metatags?.[0]?.['og:updated_time'] || a.pagemap?.metatags?.[0]?.['article:published_time'] || a.pagemap?.metatags?.[0]?.['og:published_time'];
      const dateB = b.pagemap?.metatags?.[0]?.['og:updated_time'] || b.pagemap?.metatags?.[0]?.['article:published_time'] || b.pagemap?.metatags?.[0]?.['og:published_time'];
      return new Date(dateB) - new Date(dateA);
    });

    res.json(sortedResults);
  } catch (error) {
    console.error('Error fetching Google search results:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch Google search results' });
  }
};

module.exports = {
  searchGoogle,
};