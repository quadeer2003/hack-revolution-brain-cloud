"use client";

import { cn } from "@/lib/utils";
import { FaCoffee } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from 'next/navigation'
import Summarize from './page'


export const BentoGridItem = ({
  className,
  title,
  description ='',
  icon = <FaCoffee />,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string ;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  const router = useRouter()
  const summarize = async ({description}: {description: string}) => {
      try{
          const response = await fetch(`/api/summarize?content=${description}`);
          const data = await response.json()
          console.log(data.content)
          const summary = data.content
          if(data) {
            router.push(`/smartSearch/summarize?summary=${encodeURIComponent(summary)}`)
          }
        
      } catch(error) {
        console.log("prob")
      }
  }
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento w-2/3 mt-2 shadow-2xl p-8 transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
        className
      )}
    >
        <Image className="flex justify-center items-center" src="/output.png" alt="logo" width={200} height={100}/>
        <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mt-2">
          {title}
        </div>
        <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300 line-clamp-3">
          {description}
        </div>
        <div className="flex justify-between">
          <button onClick={() => summarize({description})} className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black hover:bg-white hover:text-black border hover:border-black text-white text-xs font-bold">Summarize</button>
          <button className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black hover:bg-white hover:text-black border hover:border-black text-white text-xs font-bold">Chat</button>
          
        </div>
      </div>
  );
};

export default BentoGridItem;
