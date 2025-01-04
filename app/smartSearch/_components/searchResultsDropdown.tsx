'use client'

import React from 'react'

function searchResultsDropdown({results, onSelect}: {results : any[], onSelect : (result : any) => void}) {
  return (
    <div className='w-full'>
        {results.map((result) => (
            <a className='line-clamp-1 list-none cursor-pointer border-b hover-bg-gray-100 transform tranition duration-300 ease-in-out hover:scale-105 translate-x-4' key={result.title} onClick={() => onSelect(result.title)}>
               <li className='p-1'>{result.title}</li> 
            </a>
        ))}
    </div>
  )
}

export default searchResultsDropdown