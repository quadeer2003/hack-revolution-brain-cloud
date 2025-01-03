import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

export function Features() {
  return (
    <div className="px-4 py-16 max-w-6xl mx-auto">
      {/* Heading and Tagline Section */}
      {/* <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-purple-600 mb-4">Features</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Explore the key features that make our platform unique and impactful.
        </p>
      </div> */}

      {/* Features Grid */}
      <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[20rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={<span className="text-purple-600">{item.title}</span>} // Purple heading
            description={item.description}
            header={
              item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-xl"
                />
              ) : (
                item.header
              )
            }
            className={cn(
              item.className,
              "transition-all duration-300 rounded-xl",
              // Box shadow for both light and dark modes
              "shadow-[rgba(128,0,128,0.6)_0px_4px_10px,_rgba(128,0,128,0.6)_0px_6px_15px] dark:shadow-[rgba(128,0,128,0.9)_0px_4px_10px,_rgba(128,0,128,0.9)_0px_6px_15px]",
              // On hover, remove the shadow and add only the border
              "hover:shadow-none dark:hover:shadow-none hover:border-2 hover:border-purple-600 dark:hover:border-purple-500"
            )}            
            icon={<span className="text-purple-600">{item.icon}</span>} // Purple icon
          />
        ))}
      </BentoGrid>
    </div>
  );
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl dark:bg-dot-white/[0.2] bg-dot-black/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)] border border-transparent dark:border-white/[0.2] bg-neutral-100 dark:bg-black"></div>
);

const items = [
  {
    title: "The Dawn of Innovation",
    description: "Explore the birth of groundbreaking ideas and inventions.",
    header: <Skeleton />,
    className: "md:col-span-2",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    image: "https://via.placeholder.com/100x100?text=Innovation",
  },
  {
    title: "The Digital Revolution",
    description: "Dive into the transformative power of technology.",
    header: <Skeleton />,
    className: "md:col-span-1",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    image: "https://via.placeholder.com/300x200?text=Digital+Revolution",
  },
  {
    title: "The Art of Design",
    description: "Discover the beauty of thoughtful and functional design.",
    header: <Skeleton />,
    className: "md:col-span-1",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    image: "https://via.placeholder.com/300x200?text=Design",
  },
  {
    title: "The Power of Communication",
    description: "Understand the impact of effective communication in our lives.",
    header: <Skeleton />,
    className: "md:col-span-2",
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
    image: "https://via.placeholder.com/300x200?text=Communication",
  },
];