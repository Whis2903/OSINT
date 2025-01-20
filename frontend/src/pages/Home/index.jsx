import React, { useState, useEffect } from "react";
import SearchCard from "../../components/SearchCard";
import ResultComponent from "../../components/ResultComponent";
import FilterButton from "../../components/FilterButton";
import { buttonList } from "../../config";
import {url} from '../../config'
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
  const [isNsfwFilterEnabled, setIsNsfwFilterEnabled] = useState(false);

  const [visiblePosts, setVisiblePosts] = useState([]);
  const [visibleVideos, setVisibleVideos] = useState([]);
  const [visibleSearchResults, setVisibleSearchResults] = useState([]);
  const [visibleNews, setVisibleNews] = useState([]);

  const nsfwWords = [
    "penis", "vagina", "breasts", "ass", "tits", "dick", "pussy", "clit",
    "sex", "fuck", "intercourse", "blowjob", "handjob", "cum", "ejaculate", 
    "orgasm", "piss", "shit", "fart", "vomit", "lingerie", "fetish", 
    "bondage", "bdsm", "nude", "porn", "erotic", "masturbate", "nipple", 
    "crotch", "genitals", "anus", "stripper", "prostitute", "hooker", 
    "slut", "whore", "horny", "seduce", "penetration", "kinky", "erotica", 
    "lapdance", "lust", "orgy", "squirting", "spank", "threesome", "voyeur", 
    "hentai", "incest", "bestiality", "necrophilia", "peeping", "rape", 
    "molest", "pedophile", "semen", "twerk", "thong", "booty", "dildo", 
    "vibrator", "buttplug", "kamasutra", "taboo", "dominatrix", "escort", 
    "xxx", "adult", "scat", "cumshot", "deepthroat", "gangbang", "lesbian", 
    "gay", "bisexual", "transsexual", "orgasmic", "rimming", "rimjob", 
    "submission", "dominance", "fluffer", "felch", "snowballing", "cumplay", 
    "wetdream", "handy", "milking", "jerkoff", "bdsm", "bondage", "discipline", 
    "sadism", "masochism", "roleplay", "dirtytalk", "facial", "gagging", 
    "fisting", "golden shower", "cuckold", "swingers", "polyamory", 
    "softcore", "hardcore", "bareback", "bukkake", "creampie", "cumslut", 
    "cumdumpster", "docking", "double penetration", "enema", "exhibitionism", 
    "felching", "foot fetish", "gloryhole", "gokkun", "group sex", "jailbait", 
    "kink", "money shot", "pegging", "queef", "rimjob", "sex toy", "strap-on", 
    "swinging", "teabagging", "titfuck", "twink", "voyeurism", "watersports", 
    "yiff", "zoophilia"
  ] 

  const filterNsfwContent = (content) => {
    if (!isNsfwFilterEnabled) return content;
    return content.filter(item => {
      const text = item.title || item.description || item.content || "";
      return !nsfwWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
    });
  };

  useEffect(() => {
    switch (activeFilterButton) {
      case API.REDDIT:
        setVisiblePosts(filterNsfwContent(posts));
        setVisibleVideos([]);
        setVisibleSearchResults([]);
        setVisibleNews([]);
        break;
      case API.YOUTUBE:
        setVisiblePosts([]);
        setVisibleVideos(filterNsfwContent(videos));
        setVisibleSearchResults([]);
        setVisibleNews([]);
        break;
      case API.GOOGLE:
        setVisiblePosts([]);
        setVisibleVideos([]);
        setVisibleSearchResults(filterNsfwContent(searchResults));
        setVisibleNews([]);
        break;
      case API.NEWS:
        setVisiblePosts([]);
        setVisibleVideos([]);
        setVisibleSearchResults([]);
        setVisibleNews(filterNsfwContent(news));
        break;
      default:
        setVisiblePosts(filterNsfwContent(posts));
        setVisibleVideos(filterNsfwContent(videos));
        setVisibleSearchResults(filterNsfwContent(searchResults));
        setVisibleNews(filterNsfwContent(news));
    }
  }, [activeFilterButton, posts, videos, searchResults, news, isNsfwFilterEnabled]);

  const fetchData = async (keywords) => {
    if (!keywords.length) {
      console.log("Keywords are required!");
      return;
    }

    try {
      const queryString = keywords
        .map((keyword) => `keywords[]=${encodeURIComponent(keyword)}`)
        .join("&");
      const redditUrl = `${url.backend}/api/reddit/posts?${queryString}`;
      const youtubeUrl = `${url.backend}/api/youtube/videos?${queryString}`;
      const googleSearchUrl = `${url.backend}/api/google/search?${queryString}`;
      const newsUrl = `${url.backend}/api/news/search?${queryString}`;

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
<button
  className={`filter-toggle px-4 py-2 rounded-lg font-semibold text-white 
    ${isNsfwFilterEnabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
  onClick={() => setIsNsfwFilterEnabled(!isNsfwFilterEnabled)}
>
  {isNsfwFilterEnabled ? "Disable" : "Enable"} NSFW Filter
</button>
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