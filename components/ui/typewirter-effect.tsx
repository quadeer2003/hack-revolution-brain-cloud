"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  // Ref for measuring the height of the text
  const textRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState<number | null>(null);

  // Calculate the line height based on the text size after the component mounts
  useEffect(() => {
    if (textRef.current) {
      const height = textRef.current.getBoundingClientRect().height;
      setLineHeight(height);
    }
  }, []); // Only run after the component mounts on the client

  const renderWords = () => {
    return (
      <div ref={textRef}>
        {wordsArray.map((word, idx) => {
          return (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span
                  key={`char-${index}`}
                  className={cn(`dark:text-white text-black`, word.className)}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{
          width: "0%",
        }}
        whileInView={{
          width: "fit-content",
        }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="text-xs sm:text-base md:text-xl lg:text-3xl xl:text-5xl font-bold"
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {renderWords()}{" "}
        </div>{" "}
      </motion.div>
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn("block rounded-sm w-[4px] bg-blue-500", cursorClassName)}
        style={{
          height: lineHeight ? lineHeight : "auto", // Dynamically set height only after mounting
        }}
      ></motion.span>
    </div>
  );
};
