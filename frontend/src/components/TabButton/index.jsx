import React from 'react';

const TabButton = ({ isActive, onClick, children }) => {
  return (
    <button
      className={`px-4 py-2 mx-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TabButton;