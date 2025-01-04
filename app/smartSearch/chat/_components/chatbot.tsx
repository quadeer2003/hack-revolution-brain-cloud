"use client";

import React, { useState, ChangeEvent } from "react";
import { FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Message {
  text: string;
  user: boolean;
}

function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendMessage = async (): Promise<void> => {
    if (input.trim()) {
      // Add user message to the conversation
      const newMessages = [...messages, { text: input, user: true }];
      setMessages(newMessages);
      setInput("");

      try {
        setLoading(true);
        const response = await fetch("api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: input,
        });
        if (response.ok) {
          const reply = await response.json()
          setMessages([...newMessages, { text: reply, user: false }]);
        }8
      } catch (error: any) {
        // Handle rate limiting or other errors
        if (error.response?.status === 429) {
          setMessages([
            ...newMessages,
            {
              text: "Error: Too many requests. Please try again later.",
              user: false,
            },
          ]);
        } else {
          setMessages([
            ...newMessages,
            {
              text: "Error: Something went wrong. Please try again.",
              user: false,
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <h1 className="mb-8 font-bold text-[3rem] drop-shadow-lg text-blue-50">
        AI ChatBot
      </h1>
      <div className="bg-white w-full max-w-lg shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 h-96 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.user ? "justify-end" : "justify-start"
              } mb-2`}
            >
              <div
                className={`rounded-lg p-2 shadow-md overflow-x-hidden flex flex-wrap ${
                  msg.user ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="wrapper">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="shadow"></div>
              <div className="shadow"></div>
              <div className="shadow"></div>
              <span>Loading</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg outline-none"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
          />
          <button
            className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all"
            onClick={handleSendMessage}
            disabled={loading}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
