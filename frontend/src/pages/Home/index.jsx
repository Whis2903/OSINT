import SearchCard from "../../components/SearchCard";
import ResultCard from "../../components/ResultComponent";
import { useState } from "react";
import ResultComponent from "../../components/ResultComponent";
const Homepage = () => {

  const [posts, setPosts] = useState([]);

  const fetchData = async(keyword)=>{
    if (!keyword.trim()) { // Double-checking that the keyword is not empty
      console.log("Keyword is required!");
      return;
    }

    try{
      const url = `http://localhost:5000/api/reddit/posts?keyword=${keyword}`;
      const response = await fetch(url);
      const data = await response.json();
      setPosts(data)
    } catch(e) {
      console.error(`Error in fetching the data : ${e}` )
    }
  }

  return (
    <>

        <div className="flex justify-center">
          <SearchCard fetchData={fetchData}/>
        </div>

        <div className="result div"> 
          <ResultComponent posts={posts}/>
        </div>
    </>
  );
};

export default Homepage;
