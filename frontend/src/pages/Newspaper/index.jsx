import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NewsPaper = () => {
  const [imageId, setImageId] = useState(null);
  const [imagesByNewspaper, setImagesByNewspaper] = useState({});
  const [previousImagesByNewspaper, setPreviousImagesByNewspaper] = useState({});
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNewspapers, setExpandedNewspapers] = useState({});
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/newspaper/images');
        setImageId(response.data.imageId);
      } catch (error) {
        console.error('Error fetching newspaper images:', error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (imageId) {
      const fetchImagesById = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/newspaper/images/${imageId}`);
          setImagesByNewspaper(response.data);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching images by ID:', error);
          setLoading(false);
        }
      };

      fetchImagesById();
    }
  }, [imageId]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/newspaper/available-dates');
        setAvailableDates(response.data);
      } catch (error) {
        console.error('Error fetching available dates:', error);
      }
    };

    fetchAvailableDates();
  }, []);

  const fetchPreviousImagesByDate = async (date) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/newspaper/previous-images/${date}`);
      setPreviousImagesByNewspaper((prev) => ({
        ...prev,
        [date]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching images for date ${date}:`, error);
    }
  };

  const toggleExpand = (newspaper) => {
    setExpandedNewspapers((prev) => ({
      ...prev,
      [newspaper]: !prev[newspaper],
    }));
  };

  const getHostname = (url) => {
    const { hostname } = new URL(url);
    const name = hostname.replace('www.', '').split('.')[0];
    return name;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-white text-3xl font-bold text-center mb-6">Newspaper Images</h1>
      <div className="flex justify-center mb-6">
        <button
          className={`px-4 py-2 mx-2 rounded-lg ${activeTab === 'current' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setActiveTab('current')}
        >
          Current Newspapers
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded-lg ${activeTab === 'previous' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
          onClick={() => setActiveTab('previous')}
        >
          Previous Newspapers
        </button>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center">Loading...</p>
      ) : activeTab === 'current' ? (
        Object.keys(imagesByNewspaper).length > 0 ? (
          Object.entries(imagesByNewspaper).map(([newspaper, images], index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(newspaper)}>
                <h2 className="text-white text-xl">{getHostname(newspaper)}</h2>
                {expandedNewspapers[newspaper] ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
              </div>
              {expandedNewspapers[newspaper] && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {images.map((image, idx) => (
                    <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                      <img src={image} alt={`Newspaper ${idx}`} className="w-full h-auto rounded-md" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No images found.</p>
        )
      ) : (
        <>
          {availableDates.length > 0 ? (
            availableDates.map((date, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => {
                  toggleExpand(date);
                  if (!previousImagesByNewspaper[date]) {
                    fetchPreviousImagesByDate(date);
                  }
                }}>
                  <h2 className="text-white text-xl">{date}</h2>
                  {expandedNewspapers[date] ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
                </div>
                {expandedNewspapers[date] && previousImagesByNewspaper[date] && (
                  <div className="mt-4">
                    {Object.entries(previousImagesByNewspaper[date]).map(([newspaper, images], idx) => (
                      <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(newspaper)}>
                          <h2 className="text-white text-xl">{getHostname(newspaper)}</h2>
                          {expandedNewspapers[newspaper] ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
                        </div>
                        {expandedNewspapers[newspaper] && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {images.map((image, idx) => (
                              <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                <img src={image} alt={`Newspaper ${idx}`} className="w-full h-auto rounded-md" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center">No previous images found.</p>
          )}
        </>
      )}
    </div>
  );
};

export default NewsPaper;