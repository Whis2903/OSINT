import React, { useState, useEffect } from "react";
import SearchCard from "../../components/SearchCard";
import ResultComponent from "../../components/ResultComponent";
import FilterButton from "../../components/FilterButton";
import { buttonList } from "../../config";

const API = {
  REDDIT: "Reddit",
  YOUTUBE: "Youtube",
  GOOGLE: "Google",
  NEWS: "News Articles",
};

const Homepage = () => {
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [news, setNews] = useState([]);
  const [activeFilterButton, setActiveFilterButton] = useState("All");

  const [visiblePosts, setVisiblePosts] = useState([]);
  const [visibleVideos, setVisibleVideos] = useState([]);
  const [visibleSearchResults, setVisibleSearchResults] = useState([]);
  const [visibleNews, setVisibleNews] = useState([]);

  useEffect(() => {
    switch (activeFilterButton) {
      case API.REDDIT:
        setVisiblePosts(posts);
        setVisibleVideos([]);
        setVisibleSearchResults([]);
        setVisibleNews([]);
        break;
      case API.YOUTUBE:
        setVisiblePosts([]);
        setVisibleVideos(videos);
        setVisibleSearchResults([]);
        setVisibleNews([]);
        break;
      case API.GOOGLE:
        setVisiblePosts([]);
        setVisibleVideos([]);
        setVisibleSearchResults(searchResults);
        setVisibleNews([]);
        break;
      case API.NEWS:
        setVisiblePosts([]);
        setVisibleVideos([]);
        setVisibleSearchResults([]);
        setVisibleNews(news);
        break;
      default:
        setVisiblePosts(posts);
        setVisibleVideos(videos);
        setVisibleSearchResults(searchResults);
        setVisibleNews(news);
    }
  }, [activeFilterButton, posts, videos, searchResults, news]);

  const fetchData = async (keywords) => {
    if (!keywords.length) {
      console.log("Keywords are required!");
      return;
    }

    try {
      const queryString = keywords
        .map((keyword) => `keywords[]=${encodeURIComponent(keyword)}`)
        .join("&");
      const redditUrl = `http://localhost:5000/api/reddit/posts?${queryString}`;
      const youtubeUrl = `http://localhost:5000/api/youtube/videos?${queryString}`;
      const googleSearchUrl = `http://localhost:5000/api/google/search?${queryString}`;
      const newsUrl = `http://localhost:5000/api/news/search?${queryString}`;

      const [
        redditResponse,
        youtubeResponse,
        googleSearchResponse,
        newsResponse,
      ] = await Promise.all([
        fetch(redditUrl),
        fetch(youtubeUrl),
        fetch(googleSearchUrl),
        fetch(newsUrl),
      ]);

      if (
        !redditResponse.ok ||
        !youtubeResponse.ok ||
        !googleSearchResponse.ok ||
        !newsResponse.ok
      ) {
        throw new Error("Failed to fetch data from one or more APIs");
      }

      const redditData = await redditResponse.json();
      const youtubeData = await youtubeResponse.json();
      const googleSearchData = await googleSearchResponse.json();
      const newsData = await newsResponse.json();

      const redditPosts = redditData.map((post) => ({ ...post, isReddit: true }));

      const sortedYouTubeVideos = youtubeData.sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      );

      const sortedGoogleSearchResults = googleSearchData.sort((a, b) => {
        const dateA =
          a.pagemap?.metatags?.[0]?.["og:updated_time"] ||
          a.pagemap?.metatags?.[0]?.["article:published_time"] ||
          a.pagemap?.metatags?.[0]?.["og:published_time"];
        const dateB =
          b.pagemap?.metatags?.[0]?.["og:updated_time"] ||
          b.pagemap?.metatags?.[0]?.["article:published_time"] ||
          b.pagemap?.metatags?.[0]?.["og:published_time"];
        return new Date(dateB) - new Date(dateA);
      });

      const sortedNewsResults = newsData.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setPosts(redditPosts);
      setVideos(sortedYouTubeVideos);
      setSearchResults(sortedGoogleSearchResults || []);
      setNews(sortedNewsResults || []);
    } catch (e) {
      console.error(`Error in fetching the data: ${e}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <SearchCard fetchData={fetchData} />

      {(posts.length > 0 ||
        videos.length > 0 ||
        searchResults.length > 0 ||
        news.length > 0) && (
        <div>
          <div className="flex justify-center">
            {buttonList.map((item) => (
              <div key={item.text} className="ml-2 mr-2">
                <FilterButton
                  active={activeFilterButton === item.text}
                  clickHandler={() => setActiveFilterButton(item.text)}
                  text={item.text}
                  icon={item.icon}
                />
              </div>
            ))}
          </div>
          <div className="result-div">
            <ResultComponent
              posts={visiblePosts}
              videos={visibleVideos}
              searchResults={visibleSearchResults}
              news={visibleNews}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;