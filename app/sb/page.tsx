"use client";
import { useState } from "react";
import Sidebar from "./components/sb-navbar";
import FloatingDock from "./components/FloatingDock";
import Dashboard from "./components/Dashboard";
import Explore from "./components/Explore";
import AddThought from "./components/AddThought";
import PublishedNotes from "./components/PublishedNotes";
import ParaSpace from "./components/ParaSpace";
import { useAuth } from "./../context/AuthContext";
import Login from "./components/Login";
import Canvas from "./components/Canvas";
import SmartSearch from "./components/SmartSearch";
import GraphView from "./components/GraphView";
// import { DotPattern } from "../components/ui/dot-pattern"; 
// Mock data - replace with actual data from your backend
const mockStats = {
  totalItems: 42,
  importantToday: 5,
  categories: [
    { name: "Work", count: 15 },
    { name: "Personal", count: 12 },
    { name: "Research", count: 8 },
    { name: "Learning", count: 7 },
  ],
};

export default function Home() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("knowledge base");

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard stats={mockStats} />;
      case "knowledge base":
        return <Explore />;
      case "smart search":
        return <SmartSearch />;
      case "add new thought":
        return <AddThought />;
      case "published notes":
        return <PublishedNotes />;
      case "para space":
        return <ParaSpace />;
      case "canvas":
        return <Canvas />;
      case "graph view":
        return <GraphView />;
      default:
        return <Dashboard stats={mockStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* <DotPattern 
            className="dark:hidden"
            width={16}
            height={16}
            radius={1}
          /> */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <FloatingDock activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="w-full max-w-7xl mx-auto px-4 py-6 mt-4">
        {renderContent()}
      </main>
    </div>
  );
}
