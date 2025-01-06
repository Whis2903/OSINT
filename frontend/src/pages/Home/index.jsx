import React, { useState } from "react";
import SearchCard from "../../components/SearchCard";
import ResultComponent from "../../components/ResultComponent";

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [news, setNews] = useState([]);

  const fetchData = async (keywords) => {
    if (!keywords.length) { // Double-checking that the keywords array is not empty
      console.log("Keywords are required!");
      return;
    }

    try {
      const queryString = keywords.map(keyword => `keywords[]=${encodeURIComponent(keyword)}`).join('&');
      const redditUrl = `http://localhost:5000/api/reddit/posts?${queryString}`;
      const youtubeUrl = `http://localhost:5000/api/youtube/videos?${queryString}`;
      const googleSearchUrl = `http://localhost:5000/api/google/search?${queryString}`;
      const newsUrl = `http://localhost:5000/api/news/search?${queryString}`;

      const [redditResponse, youtubeResponse, googleSearchResponse, newsResponse] = await Promise.all([
        fetch(redditUrl),
        fetch(youtubeUrl),
        fetch(googleSearchUrl),
        fetch(newsUrl)
      ]);

      if (!redditResponse.ok || !youtubeResponse.ok || !googleSearchResponse.ok || !newsResponse.ok) {
        throw new Error('Failed to fetch data from one or more APIs');
      }

      const redditData = await redditResponse.json();
      const youtubeData = await youtubeResponse.json();
      const googleSearchData = await googleSearchResponse.json();
      const newsData = await newsResponse.json();

      // Add a property to indicate that these are Reddit posts
      const redditPosts = redditData.map(post => ({ ...post, isReddit: true }));

      // Sort YouTube videos by date
      const sortedYouTubeVideos = youtubeData.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // Sort Google search results by date if available
      const sortedGoogleSearchResults = googleSearchData.sort((a, b) => {
        const dateA = a.pagemap?.metatags?.[0]?.['og:updated_time'] || a.pagemap?.metatags?.[0]?.['article:published_time'] || a.pagemap?.metatags?.[0]?.['og:published_time'];
        const dateB = b.pagemap?.metatags?.[0]?.['og:updated_time'] || b.pagemap?.metatags?.[0]?.['article:published_time'] || b.pagemap?.metatags?.[0]?.['og:published_time'];
        return new Date(dateB) - new Date(dateA);
      });

      // Sort news results by date
      const sortedNewsResults = newsData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setPosts(redditPosts);
      setVideos(sortedYouTubeVideos);
      setSearchResults(sortedGoogleSearchResults || []);
      setNews(sortedNewsResults || []);
    } catch (e) {
      console.error(`Error in fetching the data: ${e}`);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <SearchCard fetchData={fetchData} />
      </div>

      {(posts.length > 0 || videos.length > 0 || searchResults.length > 0 || news.length > 0) && (
        <div className="result div">
          <ResultComponent posts={posts} videos={videos} searchResults={searchResults} news={news} />
        </div>
      )}
    </>
  );
};

export default Homepage;