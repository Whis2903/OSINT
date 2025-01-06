const axios = require('axios');
const cheerio = require('cheerio');

// Predefined mapping of English keywords to Urdu equivalents
const keywordMapping = {
  'pakistan army': 'پاکستان آرمی',
  'athmuqam': 'اٹھمقام',
  'nelam': 'نیلم',
  'muzzafrabad': 'مظفرآباد'
};

const fetchNewsFromAaj = async (keyword) => {
  try {
    const response = await axios.get(`https://www.aaj.tv/search?q=${encodeURIComponent(keyword)}`);
    const $ = cheerio.load(response.data);
    const articles = [];

    $('a.story__link').each((index, element) => {
      const title = $(element).text().trim();
      const url = $(element).attr('href');
      const snippet = $(element).closest('.story').find('.story__excerpt').text().trim();
      const date = $(element).closest('.story').find('.story__date').text().trim();

      articles.push({ title, url, snippet, date });
    });

    console.log(`Fetched ${articles.length} articles for keyword "${keyword}"`);
    return articles;
  } catch (error) {
    console.error(`Error fetching news from Aaj for keyword "${keyword}":`, error.message);
    return [];
  }
};

const convertKeywordsToUrdu = (keywords) => {
  return keywords.map(keyword => keywordMapping[keyword.toLowerCase()] || keyword);
};

const searchNews = async (req, res) => {
  const { keywords } = req.query;
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: 'Keywords must be an array' });
  }

  try {
    const urduKeywords = convertKeywordsToUrdu(keywords);

    const results = await Promise.all(
      urduKeywords.map(async (keyword) => {
        const aajNews = await fetchNewsFromAaj(keyword);
        return aajNews;
      })
    );

    // Flatten the results array and sort by date
    const flattenedResults = results.flat();
    const sortedResults = flattenedResults.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(sortedResults);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

module.exports = {
  searchNews,
};