import React from 'react';
import NewspaperItem from '../NewspaperItem';

const NewspaperList = ({ imagesByNewspaper, expandedNewspapers, toggleExpand }) => {
  return (
    <>
      {Object.entries(imagesByNewspaper).length > 0 ? (
        Object.entries(imagesByNewspaper).map(([newspaper, images], index) => (
          <NewspaperItem
            key={index}
            newspaper={newspaper}
            images={images}
            expanded={expandedNewspapers[newspaper]}
            toggleExpand={() => toggleExpand(newspaper)}
          />
        ))
      ) : (
        <p className="text-gray-400 text-center">No images found.</p>
      )}
    </>
  );
};

export default NewspaperList;