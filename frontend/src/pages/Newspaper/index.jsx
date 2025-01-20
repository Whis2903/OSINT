import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Import the icons
import TabButton from '../../components/TabButton';
import NewspaperList from '../../components/NewspaperList';
import {url} from '../../config'

const Newspaper = () => {
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
        const response = await axios.get(`${url.backend}/api/newspaper/images`);
        console.log('Fetched image ID:', response.data.imageId);
        if (response.data.imageId) {
          setImageId(response.data.imageId);
        } else {
          setLoading(false);
        }
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
          const response = await axios.get(`${url.backend}/api/newspaper/images/${imageId}`);
          console.log('Fetched images by ID:', response.data);
          setImagesByNewspaper(response.data);
        } catch (error) {
          console.error('Error fetching images by ID:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchImagesById();
    }
  }, [imageId]);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await axios.get(`${url.backend}/api/newspaper/available-dates`);
        console.log('Fetched available dates:', response.data);
        setAvailableDates(response.data);
      } catch (error) {
        console.error('Error fetching available dates:', error);
      }
    };

    fetchAvailableDates();
  }, []);

  const fetchPreviousImagesByDate = async (date) => {
    try {
      const response = await axios.get(`${url.backend}/api/newspaper/previous-images/${date}`);
      console.log(`Fetched images for date ${date}:`, response.data);
      setPreviousImagesByNewspaper((prev) => ({
        ...prev,
        [date]: response.data,
      }));
    } catch (error) {
      console.error(`Error fetching images for date ${date}:`, error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'previous') {
      availableDates.forEach((date) => {
        if (!previousImagesByNewspaper[date]) {
          fetchPreviousImagesByDate(date);
        }
      });
    }
  };

  const toggleExpand = (key) => {
    setExpandedNewspapers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-white text-3xl font-bold text-center mb-6">Newspaper Images</h1>
      <div className="flex justify-center mb-6">
        <TabButton
          isActive={activeTab === 'current'}
          onClick={() => handleTabChange('current')}
        >
          Current Newspapers
        </TabButton>
        <TabButton
          isActive={activeTab === 'previous'}
          onClick={() => handleTabChange('previous')}
        >
          Previous Newspapers
        </TabButton>
      </div>
      {loading ? (
        <p className="text-gray-400 text-center">Loading...</p>
      ) : activeTab === 'current' ? (
        <NewspaperList
          imagesByNewspaper={imagesByNewspaper}
          expandedNewspapers={expandedNewspapers}
          toggleExpand={toggleExpand}
        />
      ) : (
        availableDates.length > 0 ? (
          availableDates.map((date, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(date)}>
                <h2 className="text-white text-xl">{date}</h2>
                {expandedNewspapers[date] ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
              </div>
              {expandedNewspapers[date] && previousImagesByNewspaper[date] && (
                <NewspaperList
                  imagesByNewspaper={previousImagesByNewspaper[date]}
                  expandedNewspapers={expandedNewspapers}
                  toggleExpand={toggleExpand}
                />
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No previous images found.</p>
        )
      )}
    </div>
  );
};

export default Newspaper;