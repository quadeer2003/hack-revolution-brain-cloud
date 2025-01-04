"use client";

import React, { useState } from "react";
import { Models } from "appwrite";
import SearchBar from "./_components/searchBar";
import SearchResultsDropdown from "./_components/searchResultsDropdown";
import BentoGridItem from "./_components/bento-grid";
import Image from "next/image";
import { useUser } from "../contexts/UserContext";

function Page() {
  const { user } = useUser() || {};
  const [titles, setTitles] = useState<Models.Document[]>([]);
  const [page, setPage] = useState<Models.Document | null>(null);

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/getTitles?query=${query}`);
      if (!response.ok) {
        throw new Error("Failed to fetch titles");
      }
      const result = await response.json();
      if (result) setTitles(result.titles);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelect = async (title: string) => {
    try {
      const response = await fetch(`/api/getPage?query=${title}`);
      const pageData = await response.json();
      if (pageData) {
        setPage(pageData.documents[0]);
      }
      setTitles([]);
    } catch (error) {
      console.error(error);
    }
  };

  return user ? (
    <div className=" min-h-screen flex flex-col items-center py-8">
      <div className="flex flex-col items-center mt-4 mb-8">
        <Image
          src="/brain_cloud-removebg-preview.png"
          width={100}
          height={100}
          alt="logo"
        />
        <h1 className="text-2xl font-bold text-gray-800 mt-2">SmartSearch</h1>
      </div>
      <div className="shadow-lg flex flex-col rounded-lg mt-2 p-4 border border-gray-200 bg-white w-3/4 lg:w-1/2">
        <SearchBar onSearch={handleSearch} />
        <SearchResultsDropdown results={titles} onSelect={handleSelect} />
      </div>
      {page ? (
        <div className="mt-8 w-3/4 lg:w-1/2 mx-auto flex items-center justify-center">
          <BentoGridItem title={page.title} description={page.content} />
        </div>
      ) : null}
    </div>
  ) : (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-700">
        Please login to access SmartSearch
      </p>
    </div>
  );
}

export default Page;
