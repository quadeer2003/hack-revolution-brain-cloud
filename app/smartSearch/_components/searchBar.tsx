"use client"

import React, {useEffect, useState} from 'react'
import { Models } from 'appwrite'
// import { useDebounce } from 'use-debounce'

function SearchBar({onSearch} : {onSearch: (query: string) => void}) {
  const [query, setQuery] = useState<string>("")

  // const [debouncedQuery] = useDebounce(query, 500)
  
    // useEffect(() => {
    //   if(debouncedQuery && query.length > 0) {
    //     onSearch(query)
    //     // console.log("first")
    //   }
    // }, [query, onSearch])
    
    useEffect(() => {
      if(query)
        onSearch(query)

    }, [query])
  
    return (
      <div className='flex justify-center items-center w-full'>
          <input 
          className='flex h-10 w-full border-2 border-purple-500 bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm focus:border-purple-700 focus:outline-none file:bg-transparent m-1 focus:border-purple-500'
              placeholder='Type @ to find specific entries...' 
              type='text' 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
          />
      </div>
    )
}

export default SearchBar