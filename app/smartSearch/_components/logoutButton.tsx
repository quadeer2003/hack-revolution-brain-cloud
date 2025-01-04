"use client"

import React from 'react'
import { useUser } from '@/app/contexts/UserContext'
import { useRouter } from 'next/navigation';
// import {IconLogout} from '@tabler/icons-react';

function logoutButton() {
    const { setUser } = useUser() || { setUser: () => {} };
    const router = useRouter()
    const handleLogout = async() => {
      try{
          const response = await fetch('/api/logout', {
              method: 'POST', 
          })
          console.log(response)
          if(response.ok) {
              setUser(null)
              console.log(response.json())
              router.push('/login')
          }
      } catch(error) {
        console.log("logout error")
      }
    }
  return (
    <button onClick={handleLogout} className="btn-logout bg-red-500 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition duration-300 ease-in-out">
       {/* <IconLogout size={24} className="mr-2" /> */}
      Logout
    </button>
  )
}

export default logoutButton