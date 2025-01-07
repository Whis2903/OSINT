import { Search } from 'lucide-react';
import { useState } from 'react';

const SearchCard = ({ fetchData }) => {
  const [keywords, setKeywords] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const keywordArray = keywords.split(',').map(keyword => keyword.trim());
    fetchData(keywordArray);
    setKeywords("");
  };

  return (
    <>
      <div className="w-full max-w-sm p-3 bg-gray-900 border border-gray-700 rounded-lg shadow sm:p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 transform scale-90">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="search_text"
            id="search_text"
            className="mt-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Enter keywords (comma-separated)"
            onChange={(e) => setKeywords(e.target.value)}
            value={keywords}
            required
            autoComplete="off"
          />
          <div className="flex justify-center my-3">
            <button
              type="submit"
              className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-3 py-2 text-center dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-700 flex items-center"
            >
              <Search className='w-4 h-4 mr-2' />
              Search
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SearchCard;