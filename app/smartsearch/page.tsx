'use client'

import React, {useState} from 'react'
import { Models } from "appwrite"
import SearchBar from './_components/searchBar'
import SearchResultsDropdown from './_components/searchResultsDropdown'
import BentoGridItem from './_components/bento-grid'
import Image from 'next/image'

function Page() {
  const [titles, setTitles] = useState<Models.Document[]>([]);
  const [page, setPage] = useState<Models.Document | null>(null);
  
  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/getTitles?query=${query}`);
      if (!response.ok) {
        throw new Error('Failed to fetch titles');
      }
      const result = await response.json();
      if(result)
        setTitles(result.titles);
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleSelect = async (title: string) => {
    try {
      const response = await fetch(`/api/getPage?query=${title}`)
      const pageData = await response.json()
      if(pageData) {
        setPage(pageData.documents[0])
      }
      setTitles([])
    } catch (error) {
      console.error(error);
    }
  }

  return (
  <div className=''>
     <div className='flex flex-col  justify-start pt-[1%] min-h-screen items-center p-2  '>
      <Image src='/brain_cloud-removebg-preview.png' width={100} height={100} alt="logo" />
       <div className='shadow-lg flex flex-col rounded-lg mt-2 p-2 border overflow-hidden w-2/3'>
          <SearchBar onSearch={handleSearch} />
          <SearchResultsDropdown results={titles} onSelect={handleSelect} />
       </div>
        {page ? <BentoGridItem title={page.title} description={page.content} /> : null}
     </div>
   </div>
  )
}

export default Page