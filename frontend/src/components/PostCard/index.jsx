import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { FaRedditAlien, FaYoutube, FaGoogle, FaRegNewspaper } from 'react-icons/fa6';
import axios from 'axios';

const PostCard = ({ post }) => {
  const [translatedTitle, setTranslatedTitle] = useState(post.title);
  const [translatedSnippet, setTranslatedSnippet] = useState(post.snippet);

  useEffect(() => {
    const translateText = async (text) => {
      try {
        const response = await axios.post('https://libretranslate.com/translate', {
          q: text,
          source: 'ur',
          target: 'en',
          format: 'text'
        });
        return response.data.translatedText;
      } catch (error) {
        console.error('Error translating text:', error.message);
        return text; // Return the original text if translation fails
      }
    };

    const translateContent = async () => {
      const translatedTitle = await translateText(post.title);
      const translatedSnippet = await translateText(post.snippet);
      setTranslatedTitle(translatedTitle);
      setTranslatedSnippet(translatedSnippet);
    };

    if (post.isNews) {
      translateContent();
    }
  }, [post]);

  const postDate = post.created_utc
    ? new Date(post.created_utc * 1000).toLocaleString()
    : post.publishedAt
    ? new Date(post.publishedAt).toLocaleString()
    : post.pagemap && post.pagemap.metatags && post.pagemap.metatags[0]['og:updated_time']
    ? new Date(post.pagemap.metatags[0]['og:updated_time']).toLocaleString()
    : post.pagemap && post.pagemap.metatags && post.pagemap.metatags[0]['article:published_time']
    ? new Date(post.pagemap.metatags[0]['article:published_time']).toLocaleString()
    : post.pagemap && post.pagemap.metatags && post.pagemap.metatags[0]['og:published_time']
    ? new Date(post.pagemap.metatags[0]['og:published_time']).toLocaleString()
    : post.date
    ? new Date(post.date).toLocaleString()
    : null; // Convert timestamp to date string if available

  const getTranslatedUrl = (url) => {
    return `https://translate.google.com/translate?sl=auto&tl=en&u=${encodeURIComponent(url)}`;
  };

  return (
    <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg transform scale-100 mx-auto sm:mx-0 hover:shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col relative">
      <a href={getTranslatedUrl(post.url)} target="_blank" rel="noopener noreferrer">
        <h6 className="hover:underline mb-2 text-md sm:text-md md:text-md font-semibold tracking-tight text-white">
          {translatedTitle}
        </h6>
      </a>
      {postDate && <p className="text-gray-400 text-sm">{postDate}</p>} {/* Display date if available */}
      <p className="text-gray-400 text-sm line-clamp-3">{translatedSnippet}</p> {/* Display content, description, or snippet */}
      <div className="flex-grow"></div>
      <div className="flex justify-between items-center justify-end mt-auto">
        {post.comments_count !== undefined && (
          <div className="m-2.5 text-white flex items-center">
            <MessageSquare className="mr-1" />
            {post.comments_count}
          </div>
        )}
        <a
          href={getTranslatedUrl(post.url)}
          rel="noopener noreferrer"
          target="_blank"
          className="inline-flex font-medium items-center text-blue-400 hover:underline"
        >
          {post.url.includes('youtube.com') ? 'Watch video' : 'Read more'}
          <svg
            className="w-3 h-3 ms-2.5 rtl:rotate-[270deg]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
            />
          </svg>
        </a>
      </div>
      {post.isReddit && (
        <FaRedditAlien className="absolute top-2 right-2 w-6 h-6 text-orange-500" />
      )}
      {post.url.includes('youtube.com') && (
        <FaYoutube className="absolute top-2 right-2 w-6 h-6 text-red-600" />
      )}
      {post.isGoogle && (
        <FaGoogle className="absolute top-2 right-2 w-6 h-6 text-blue-500" />
      )}
      {post.isNews && (
        <FaRegNewspaper className="absolute top-2 right-2 w-6 h-6 text-gray-400" />
      )}
    </div>
  );
};

export default PostCard;