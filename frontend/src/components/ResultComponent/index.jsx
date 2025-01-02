import './styles.css';
import PostCard from '../PostCard';

const ResultComponent = ({ posts }) => {
  return (
    <div className="flex justify-center items-start">
      {/* Card with fixed height and scrollable content */}
      <div className="w-[80%] h-[63vh] mt-6 bg-gray-800 rounded-lg shadow-lg overflow-y-auto p-4 scrollbar-custom">
        {/* Content inside the scrollable card */}
        <h2 className="text-white text-center text-2xl font-semibold mb-4">
          Results
        </h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.url} post={post} />
            ))}
          </div>
        ) : (
          <div className=" mt-20 text-center text-gray-400 mt-6">
            <p>No results found.</p>
            <p>Try adjusting your search or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultComponent;
