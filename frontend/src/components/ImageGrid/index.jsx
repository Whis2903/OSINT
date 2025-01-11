import React from 'react';
import './styles.css'; // Import the CSS file

const ImageGrid = ({ images }) => {
  const handleImageClick = (image) => {
    window.open(image, '_blank');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {images.map((image, idx) => (
        <div key={idx} className="bg-gray-800 p-4 rounded-lg shadow-lg relative image-item">
          <img
            src={image}
            alt={`Newspaper ${idx}`}
            className="w-full h-auto rounded-md cursor-pointer"
            onClick={() => handleImageClick(image)}
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;