import './styles.css'
import React from 'react'

const FilterButton = ({text, icon, active, clickHandler}) => {
  return (
    <>

<button
      onClick={clickHandler}
      className={`bg-gray-800 text-white font-medium rounded-lg px-4 py-2 hover:bg-indigo-700  ${active && 'bg-indigo-700 outline-none'}`}
    >
      <div className="w-full flex items-center justify-between">
        <span className="mr-1.5">{icon}</span> {/* Add margin-right to icon */}
        {text}
      </div>
    </button>
    </>
  )
}

export default FilterButton