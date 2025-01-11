import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ImageGrid from '../ImageGrid';

const NewspaperItem = ({ newspaper, images, expanded, toggleExpand }) => {
  const getHostname = (url) => {
    const { hostname } = new URL(url);
    const name = hostname.replace('www.', '').split('.')[0];
    return name;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
      <div className="flex justify-between items-center cursor-pointer" onClick={toggleExpand}>
        <h2 className="text-white text-xl">{getHostname(newspaper)}</h2>
        {expanded ? <ChevronUp className="text-white" /> : <ChevronDown className="text-white" />}
      </div>
      {expanded && <ImageGrid images={images} />}
    </div>
  );
};

export default NewspaperItem;