import { MessageSquare } from 'lucide-react';

const PostCard = ({ post }) => {
  return (
    <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg transform scale-100 mx-auto sm:mx-0 hover:shadow-xl hover:scale-105 transition-transform duration-300 flex flex-col">
      <a href="#">
        <h6 className="mb-2 text-md sm:text-md md:text-md font-semibold tracking-tight text-white">
          {post.title}
        </h6>
      </a>
      {/* Add flex-grow to push comments and read more to the bottom */}
      <div className="flex-grow"></div>
      <div className="flex justify-between items-center justify-end mt-auto">
        <div className="m-2.5 text-white flex items-center">
          <MessageSquare className="mr-1" />
          {post.comments_count}
        </div>
        <a
          href={post.url}
          rel="noopener noreferrer"
          target="_blank"
          className="inline-flex font-medium items-center text-blue-400 hover:underline"
        >
          Read More
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
    </div>
  );
};

export default PostCard;
