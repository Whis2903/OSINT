import { Search } from 'lucide-react';
import { useState } from 'react';

const SearchCard = ({ fetchData }) => {
  const [keyword, setKeyword] = useState("");
  return (
<>
    <div className="w-full max-w-sm p-4 bg-gray-900 border border-gray-700 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 transform scale-y-95">
      <form
      onSubmit={(e)=>{
        e.preventDefault();
        console.log("click")
        fetchData(keyword)
        setKeyword("")
      }}
      >
      <input
            type="text"
            name="search_text"
            id="search_text"
            className="mt-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Enter keyword"
            onChange={(e)=>{setKeyword(e.target.value)}}
            value={keyword}
            required
            autoComplete="off"
        />
        <div className="flex justify-center my-4">
        <div className="flex justify-center my-4">
          <button
            className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-700 flex items-center"
          >
            <Search className='w-4 h-4 mr-2' />
            Search
          </button>
        </div>
        </div>
      </form>

    </div>
</>




  )
}

export default SearchCard